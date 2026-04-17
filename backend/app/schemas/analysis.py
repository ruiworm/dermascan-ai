from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class ReportRequest(BaseModel):
    has_itching_or_pain: bool
    has_recent_changes: bool
    has_similar_lesions: bool

class HealthAdviceBase(BaseModel):
    symptoms_description: Optional[str] = None
    recommended_treatment: Optional[str] = None
    daily_care: Optional[str] = None
    medical_advice: Optional[str] = None

class HealthAdvice(HealthAdviceBase):
    id: int
    analysis_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

class ImageBase(BaseModel):
    filename: str
    content_type: Optional[str] = None
    file_size: Optional[int] = None

class Image(ImageBase):
    id: int
    user_id: int
    file_path: str
    created_at: datetime

    model_config = {"from_attributes": True}

class AnalysisBase(BaseModel):
    image_id: int

class AnalysisCreate(AnalysisBase):
    pass

from app.schemas.user import User as UserSchema

class Analysis(AnalysisBase):
    id: int
    user_id: int
    disease_type: Optional[str] = None
    confidence: Optional[float] = None
    features: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    
    # Detailed related data
    health_advice: Optional[HealthAdvice] = None
    image: Optional[Image] = None
    user: Optional[UserSchema] = None

    model_config = {"from_attributes": True}
