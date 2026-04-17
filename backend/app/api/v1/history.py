from typing import Any, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.analysis import Analysis
from app.schemas.response import PaginatedResponse
from app.models.analysis import Analysis as AnalysisModel

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[List[Analysis]])
async def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(100, ge=1, le=1000, description="Items per page")
) -> Any:
    """
    Get user's analysis history with pagination.
    Results are ordered by creation date descending.
    """
    skip = (page - 1) * size
    
    # Base query for the current user's analyses
    base_query = db.query(AnalysisModel).filter(AnalysisModel.user_id == current_user.id)
    
    # Get total count
    total = base_query.count()
    
    from sqlalchemy.orm import joinedload
    # Get paginated items with eagerly loaded relationships
    analyses = base_query.options(
        joinedload(AnalysisModel.health_advice),
        joinedload(AnalysisModel.image),
        joinedload(AnalysisModel.user)
    ).order_by(desc(AnalysisModel.created_at)).offset(skip).limit(size).all()
    
    return PaginatedResponse(
        data=analyses,
        total=total,
        page=page,
        size=size,
        message="History retrieved successfully"
    )
