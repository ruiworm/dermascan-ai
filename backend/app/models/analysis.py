from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Local file path / URL
    content_type = Column(String)
    file_size = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship("Analysis", back_populates="image", uselist=False, cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_id = Column(Integer, ForeignKey("images.id"), unique=True)
    
    # DermFM-Zero results
    disease_type = Column(String, index=True)
    confidence = Column(Float)
    features = Column(JSON, nullable=True)  # Store bounding boxes or extracted features
    status = Column(String, default="pending")  # pending, processing, completed, failed
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analyses")
    image = relationship("Image", back_populates="analysis")
    health_advice = relationship("HealthAdvice", back_populates="analysis", uselist=False, cascade="all, delete-orphan")


class HealthAdvice(Base):
    __tablename__ = "health_advice"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), unique=True)
    
    # Qwen LLM generated advice
    symptoms_description = Column(Text)
    recommended_treatment = Column(Text)
    daily_care = Column(Text)
    medical_advice = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship("Analysis", back_populates="health_advice")
