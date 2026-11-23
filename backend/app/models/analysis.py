from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class PlantAnalysis(Base):
    __tablename__ = "plant_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    image_path = Column(String(500), nullable=False)
    
    # Identification
    common_name = Column(String(255), nullable=True)
    scientific_name = Column(String(255), nullable=True)
    identification_confidence = Column(Float, default=0.0)
    
    # Health assessment
    health_score = Column(Integer, default=0)
    health_status = Column(String(100), default="Inconclusive")
    severity = Column(String(50), default="None")
    
    # Nutrient assessment
    nutrient_deficiencies = Column(JSON, default=list)
    nutrient_observations = Column(Text, nullable=True)
    
    # Plant care instructions
    watering_guide = Column(Text, nullable=True)
    sunlight_guide = Column(Text, nullable=True)
    soil_guide = Column(Text, nullable=True)
    fertilizer_guide = Column(Text, nullable=True)
    
    # Monitoring
    next_check_days = Column(Integer, default=7)
    additional_observations = Column(JSON, default=list)
    
    # Summary & limitations
    analysis_summary = Column(Text, nullable=True)
    limitations = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="analyses")
    plant = relationship("Plant", back_populates="analyses")
    detected_issues = relationship("DetectedIssue", back_populates="analysis", cascade="all, delete-orphan")
    treatment_recommendations = relationship("TreatmentRecommendation", back_populates="analysis", cascade="all, delete-orphan")


class DetectedIssue(Base):
    __tablename__ = "detected_issues"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("plant_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    issue_name = Column(String(255), nullable=False)
    possible_disease = Column(String(255), nullable=True)
    confidence = Column(Float, default=0.0)
    observed_symptoms = Column(JSON, default=list)
    possible_causes = Column(JSON, default=list)
    severity = Column(String(50), default="Moderate")

    analysis = relationship("PlantAnalysis", back_populates="detected_issues")


class TreatmentRecommendation(Base):
    __tablename__ = "treatment_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("plant_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    immediate_actions = Column(JSON, default=list)
    organic_treatments = Column(JSON, default=list)
    other_treatment_options = Column(JSON, default=list)
    preventive_measures = Column(JSON, default=list)

    analysis = relationship("PlantAnalysis", back_populates="treatment_recommendations")
