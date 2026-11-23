from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    species = Column(String(255), nullable=True)
    category = Column(String(100), default="Houseplant")
    planting_date = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    watering_frequency = Column(String(100), default="Every 3-4 days")
    sunlight_requirement = Column(String(100), default="Bright indirect light")
    image_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="plants")
    analyses = relationship("PlantAnalysis", back_populates="plant", cascade="all, delete-orphan")
