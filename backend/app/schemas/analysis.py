from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Any

# Gemini Structured Response Schemas
class PlantIdentificationSchema(BaseModel):
    common_name: str = ""
    scientific_name: str = ""
    identification_confidence: float = 0.0

class HealthAssessmentSchema(BaseModel):
    health_score: int = 0
    health_status: str = "Inconclusive"
    severity: str = "None"

class DetectedIssueItemSchema(BaseModel):
    issue_name: str = ""
    possible_disease: str = ""
    confidence: float = 0.0
    observed_symptoms: List[str] = Field(default_factory=list)
    possible_causes: List[str] = Field(default_factory=list)

class NutrientAssessmentSchema(BaseModel):
    possible_deficiencies: List[str] = Field(default_factory=list)
    observations: str = ""

class TreatmentSchema(BaseModel):
    immediate_actions: List[str] = Field(default_factory=list)
    organic_treatments: List[str] = Field(default_factory=list)
    other_treatment_options: List[str] = Field(default_factory=list)
    preventive_measures: List[str] = Field(default_factory=list)

class PlantCareSchema(BaseModel):
    watering: str = ""
    sunlight: str = ""
    soil: str = ""
    fertilizer: str = ""

class MonitoringSchema(BaseModel):
    next_check_days: int = 7
    additional_observations: List[str] = Field(default_factory=list)

class GeminiAnalysisResult(BaseModel):
    plant_identification: PlantIdentificationSchema = Field(default_factory=PlantIdentificationSchema)
    health_assessment: HealthAssessmentSchema = Field(default_factory=HealthAssessmentSchema)
    detected_issues: List[DetectedIssueItemSchema] = Field(default_factory=list)
    nutrient_assessment: NutrientAssessmentSchema = Field(default_factory=NutrientAssessmentSchema)
    treatment: TreatmentSchema = Field(default_factory=TreatmentSchema)
    plant_care: PlantCareSchema = Field(default_factory=PlantCareSchema)
    monitoring: MonitoringSchema = Field(default_factory=MonitoringSchema)
    analysis_summary: str = ""
    limitations: List[str] = Field(default_factory=list)

# Database Response Schemas
class DetectedIssueResponse(BaseModel):
    id: int
    issue_name: str
    possible_disease: Optional[str] = None
    confidence: float = 0.0
    observed_symptoms: List[str] = Field(default_factory=list)
    possible_causes: List[str] = Field(default_factory=list)
    severity: str = "Moderate"

    class Config:
        from_attributes = True

class TreatmentResponse(BaseModel):
    id: int
    immediate_actions: List[str] = Field(default_factory=list)
    organic_treatments: List[str] = Field(default_factory=list)
    other_treatment_options: List[str] = Field(default_factory=list)
    preventive_measures: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    id: int
    user_id: int
    plant_id: Optional[int] = None
    image_path: str
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    identification_confidence: float = 0.0
    health_score: int = 0
    health_status: str
    severity: str
    nutrient_deficiencies: List[str] = Field(default_factory=list)
    nutrient_observations: Optional[str] = None
    watering_guide: Optional[str] = None
    sunlight_guide: Optional[str] = None
    soil_guide: Optional[str] = None
    fertilizer_guide: Optional[str] = None
    next_check_days: int = 7
    additional_observations: List[str] = Field(default_factory=list)
    analysis_summary: Optional[str] = None
    limitations: List[str] = Field(default_factory=list)
    created_at: datetime
    detected_issues: List[DetectedIssueResponse] = Field(default_factory=list)
    treatment_recommendations: List[TreatmentResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
