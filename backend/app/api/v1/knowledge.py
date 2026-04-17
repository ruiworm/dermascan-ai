from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.core.deps import get_db, get_current_active_superuser
from app.models.knowledge import KnowledgeBase as KnowledgeModel
from app.models.user import User
from app.schemas.knowledge import Knowledge, KnowledgeCreate, KnowledgeUpdate
from app.schemas.response import ResponseBase

router = APIRouter()

@router.get("/", response_model=ResponseBase[List[Knowledge]])
def list_knowledge(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve knowledge base articles. Free for all to view.
    """
    records = db.query(KnowledgeModel).order_by(KnowledgeModel.created_at.desc()).offset(skip).limit(limit).all()
    return ResponseBase(data=records)

@router.post("/", response_model=ResponseBase[Knowledge])
def create_knowledge(
    *,
    db: Session = Depends(get_db),
    knowledge_in: KnowledgeCreate,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Create a new knowledge base article. Admin only.
    """
    record = KnowledgeModel(**knowledge_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return ResponseBase(data=record, message="Article created successfully")

@router.put("/{knowledge_id}", response_model=ResponseBase[Knowledge])
def update_knowledge(
    *,
    db: Session = Depends(get_db),
    knowledge_id: int,
    knowledge_in: KnowledgeUpdate,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Update a knowledge base article by ID. Admin only.
    """
    record = db.query(KnowledgeModel).filter(KnowledgeModel.id == knowledge_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Article not found")
        
    update_data = knowledge_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
        
    db.commit()
    db.refresh(record)
    return ResponseBase(data=record, message="Article updated successfully")

@router.delete("/{knowledge_id}", response_model=ResponseBase[bool])
def delete_knowledge(
    *,
    db: Session = Depends(get_db),
    knowledge_id: int,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Delete a knowledge base article. Admin only.
    """
    record = db.query(KnowledgeModel).filter(KnowledgeModel.id == knowledge_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Article not found")
        
    db.delete(record)
    db.commit()
    return ResponseBase(data=True, message="Article deleted successfully")
