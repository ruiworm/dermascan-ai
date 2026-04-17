from .database import Base, engine, SessionLocal
from .user import User
from .analysis import Image, Analysis, HealthAdvice
from .knowledge import KnowledgeBase

# Export all models for Alembic to detect
__all__ = [
    "Base", 
    "engine", 
    "SessionLocal", 
    "User", 
    "Image", 
    "Analysis", 
    "HealthAdvice", 
    "KnowledgeBase"
]
