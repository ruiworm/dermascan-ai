from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Personal & Medical Information
    age = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_type = Column(String, nullable=True)
    height = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    allergies = Column(String, nullable=True)  # Store as JSON string or comma-separated
    conditions = Column(String, nullable=True)  # Store as JSON string
    medications = Column(String, nullable=True)  # Store as JSON string
    family_history = Column(String, nullable=True)  # Store as JSON string
    
    # Relationships
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
