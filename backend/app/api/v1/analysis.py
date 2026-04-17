from typing import Any
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import logging
import time

logger = logging.getLogger(__name__)

from app.core.deps import get_db
from app.models.user import User
from app.schemas.analysis import Analysis, AnalysisCreate, HealthAdvice, Image as ImageSchema, ReportRequest
from app.schemas.response import ResponseBase
from app.services.storage_service import storage_service
from app.services.dermfm_service import dermfm_service
from app.services.qwen_service import qwen_service
from app.models.analysis import Analysis as AnalysisModel, HealthAdvice as HealthAdviceModel

router = APIRouter()

from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.deps import get_db

from app.core.deps import get_db, get_current_user

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]

@router.post("/upload", response_model=ResponseBase[ImageSchema])
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Upload an image for analysis"""
    
    # 1. Validate File Type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Only {', '.join(ALLOWED_TYPES)} are allowed."
        )
        
    # 2. Store the image locally
    db_image = await storage_service.save_upload_file(file, current_user.id, db)
    
    # Return response including the direct assigned file URL (stored in file_path column)
    return ResponseBase(
        data=db_image, 
        message="Image uploaded successfully"
    )

@router.post("/analyze", response_model=ResponseBase[Analysis])
async def analyze_image(
    analysis_in: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Run model inference on an uploaded image"""
    
    # 1. Check if image exists
    from app.models.analysis import Image
    db_image = db.query(Image).filter(Image.id == analysis_in.image_id, Image.user_id == current_user.id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    # 2. Check if already analyzed
    existing_analysis = db.query(AnalysisModel).filter(AnalysisModel.image_id == analysis_in.image_id).first()
    if existing_analysis:
        return ResponseBase(data=existing_analysis, message="Image already analyzed")
        
    # 3. Create pending analysis record
    db_analysis = AnalysisModel(
        user_id=current_user.id,
        image_id=analysis_in.image_id,
        status="processing"
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    try:
        # 4. Run DermFM-Zero Models
        # Reconstruct the local file cache path if missing from db object lifecycle
        target_path = getattr(db_image, "_local_path", None)
        if not target_path:
            import os
            from app.config import settings
            filename = os.path.basename(db_image.file_path)
            temp_dir = os.path.join(settings.KNOWLEDGE_BASE_DIR, "temp")
            target_path = os.path.join(temp_dir, filename)
            
        disease_type, confidence, features = await dermfm_service.analyze_image(target_path)

        # 5. Extract top 3 features (Already done inside analyze_image)
        # Update Analysis Record
        db_analysis.disease_type = disease_type
        db_analysis.confidence = confidence
        db_analysis.features = features
        db_analysis.status = "completed"
        db.commit()
        db.refresh(db_analysis)
        
            
        return ResponseBase(data=db_analysis, message="Analysis completed successfully")
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"Analysis process crashed: {error_detail}")
        db_analysis.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=500, 
            detail=f"分析服务内部崩溃: {str(e)}。由于 AI 计算量大且在 CPU 运行，可能发生了内存溢出或模型加载超时。"
        )

@router.delete("/{analysis_id}", response_model=ResponseBase[bool])
async def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete an analysis record and its associated data"""
    db_analysis = db.query(AnalysisModel).filter(
        AnalysisModel.id == analysis_id, 
        AnalysisModel.user_id == current_user.id
    ).first()
    
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    try:
        # Note: SQLAlchemy cascade="all, delete-orphan" on the model will 
        # automatically delete HealthAdvice and Image records.
        db.delete(db_analysis)
        db.commit()
        return ResponseBase(data=True, message="Analysis deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")

@router.get("/{analysis_id}", response_model=ResponseBase[Analysis])
async def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get analysis details by ID"""
    from sqlalchemy.orm import joinedload
    db_analysis = db.query(AnalysisModel).options(
        joinedload(AnalysisModel.health_advice),
        joinedload(AnalysisModel.image),
        joinedload(AnalysisModel.user)
    ).filter(
        AnalysisModel.id == analysis_id, 
        AnalysisModel.user_id == current_user.id
    ).first()
    
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return ResponseBase(data=db_analysis)

@router.post("/{analysis_id}/report", response_model=ResponseBase[Analysis])
async def generate_analysis_report(
    analysis_id: int,
    report_in: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Generate final LLM health report based on analysis findings and patient questionnaire"""
    # 1. Fetch existing analysis
    from sqlalchemy.orm import joinedload
    db_analysis = db.query(AnalysisModel).options(
        joinedload(AnalysisModel.user)
    ).filter(
        AnalysisModel.id == analysis_id, 
        AnalysisModel.user_id == current_user.id
    ).first()
    
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if db_analysis.status != "completed":
        raise HTTPException(status_code=400, detail="Cannot generate report for incomplete analysis")
        
    # Check if advice already exists
    existing_advice = db.query(HealthAdviceModel).filter(HealthAdviceModel.analysis_id == db_analysis.id).first()
    if existing_advice:
        return ResponseBase(data=db_analysis, message="Report already generated")
        
    # 2. Get LLM Health Advice including patient answers
    try:
        start_time = time.perf_counter()
        user_answers = report_in.dict()
        
        # Log RAG and LLM start
        logger.info(f"Generating health report for analysis {analysis_id}...")
        
        advice_data = await qwen_service.generate_health_advice(
            disease_type=db_analysis.disease_type, 
            features=db_analysis.features, 
            user_answers=user_answers
        )
        
        generation_time = time.perf_counter() - start_time
        logger.info(f"Report generation for analysis {analysis_id} completed in {generation_time:.2f}s")
        
        # 3. Save HealthAdvice record
        db_advice = HealthAdviceModel(
            analysis_id=db_analysis.id,
            symptoms_description=advice_data.get("symptoms_description", ""),
            recommended_treatment=advice_data.get("recommended_treatment", ""),
            daily_care=advice_data.get("daily_care", ""),
            medical_advice=advice_data.get("medical_advice", "")
        )
        db.add(db_advice)
        db.commit()
        db.refresh(db_analysis)
        
        return ResponseBase(data=db_analysis, message="Report generated successfully")
    except Exception as e:
        logger.error(f"Failed to generate report for analysis {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
