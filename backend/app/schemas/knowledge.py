from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class KnowledgeBaseBase(BaseModel):
    title: str
    category: Optional[str] = None
    content: str
    source: Optional[str] = None

class KnowledgeCreate(KnowledgeBaseBase):
    pass

class KnowledgeUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None

class KnowledgeInDBBase(KnowledgeBaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class Knowledge(KnowledgeInDBBase):
    pass
