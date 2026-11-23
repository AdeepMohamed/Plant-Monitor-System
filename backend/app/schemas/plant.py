from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class PlantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: Optional[str] = None
    category: Optional[str] = "Houseplant"
    planting_date: Optional[str] = None
    location: Optional[str] = None
    watering_frequency: Optional[str] = "Every 3-4 days"
    sunlight_requirement: Optional[str] = "Bright indirect light"
    image_url: Optional[str] = None
    notes: Optional[str] = None

class PlantCreate(PlantBase):
    pass

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    category: Optional[str] = None
    planting_date: Optional[str] = None
    location: Optional[str] = None
    watering_frequency: Optional[str] = None
    sunlight_requirement: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

class PlantResponse(PlantBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    analyses_count: Optional[int] = 0
    latest_health_score: Optional[int] = None
    latest_health_status: Optional[str] = None

    class Config:
        from_attributes = True
