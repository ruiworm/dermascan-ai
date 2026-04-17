from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from sqlalchemy import func

from app.core.deps import get_db, get_current_active_superuser
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.user import User as UserSchema
from app.schemas.response import ResponseBase

router = APIRouter()

@router.get("/users", response_model=ResponseBase[List[UserSchema]])
def get_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return ResponseBase(data=users)

@router.delete("/users/{user_id}", response_model=ResponseBase[bool])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Delete a user. Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_superuser:
        raise HTTPException(status_code=400, detail="Cannot delete an admin user via API")
        
    db.delete(user)
    db.commit()
    return ResponseBase(data=True, message="User deleted successfully")

@router.get("/analyses", response_model=ResponseBase[List[Any]])
def get_all_analyses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Retrieve all analysis records. Admin only.
    """
    # Fetch all analyses joined with users
    analyses = db.query(Analysis, User.username, User.email).join(User, Analysis.user_id == User.id).order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()
    
    # Format the data for the dashboard
    result = []
    for analysis, username, email in analyses:
        item = {
            "id": analysis.id,
            "diseaseType": analysis.disease_type,
            "confidence": analysis.confidence,
            "status": analysis.status,
            "createdAt": analysis.created_at,
            "user": {
                "id": analysis.user_id,
                "username": username,
                "email": email
            }
        }
        result.append(item)
        
    return ResponseBase(data=result)

@router.get("/stats", response_model=ResponseBase[Any])
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Retrieve system overview statistics. Admin only.
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_scans = db.query(func.count(Analysis.id)).scalar()
    completed_scans = db.query(func.count(Analysis.id)).filter(Analysis.status == "completed").scalar()
    high_risk_scans = db.query(func.count(Analysis.id)).filter(Analysis.disease_type == "melanoma").scalar() # Melanoma is highly dangerous
    
    stats = {
        "totalUsers": total_users,
        "totalScans": total_scans,
        "completedScans": completed_scans,
        "highRiskScans": high_risk_scans
    }
    
    return ResponseBase(data=stats)
