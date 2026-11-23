from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HealthDistributionItem(BaseModel):
    name: str
    value: int
    color: str

class DiseaseSummaryItem(BaseModel):
    disease: str
    count: int

class RecentActivityItem(BaseModel):
    id: int
    type: str  # 'analysis', 'plant_added', 'care_check'
    title: str
    description: str
    timestamp: datetime
    status: Optional[str] = None
    plant_name: Optional[str] = None
    image_url: Optional[str] = None

class DashboardStatsResponse(BaseModel):
    total_plants: int
    total_analyses: int
    healthy_plants: int
    attention_needed: int
    average_health_score: float
    health_distribution: List[HealthDistributionItem]
    disease_summary: List[DiseaseSummaryItem]
