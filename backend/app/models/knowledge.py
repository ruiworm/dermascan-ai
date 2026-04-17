from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from .database import Base

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    category = Column(String, index=True)  # diseases, symptoms, treatments
    content = Column(Text, nullable=False)
    source = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
