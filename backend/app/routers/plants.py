from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.analysis import PlantAnalysis
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse
from app.schemas.analysis import AnalysisResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/plants", tags=["Plants"])

@router.get("", response_model=List[PlantResponse])
def get_user_plants(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Plant).filter(Plant.user_id == current_user.id)
    if category:
        query = query.filter(Plant.category == category)
    
    plants = query.order_by(Plant.created_at.desc()).all()
    
    # Enrich with latest health stats
    response_items = []
    for plant in plants:
        plant_resp = PlantResponse.model_validate(plant)
        plant_resp.analyses_count = len(plant.analyses)
        if plant.analyses:
            latest = sorted(plant.analyses, key=lambda a: a.created_at, reverse=True)[0]
            plant_resp.latest_health_score = latest.health_score
            plant_resp.latest_health_status = latest.health_status
        response_items.append(plant_resp)
        
    return response_items

@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
def create_plant(
    plant_in: PlantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_plant = Plant(
        user_id=current_user.id,
        name=plant_in.name,
        species=plant_in.species,
        category=plant_in.category or "Houseplant",
        planting_date=plant_in.planting_date,
        location=plant_in.location,
        watering_frequency=plant_in.watering_frequency,
        sunlight_requirement=plant_in.sunlight_requirement,
        image_url=plant_in.image_url,
        notes=plant_in.notes
    )
    db.add(new_plant)
    db.commit()
    db.refresh(new_plant)
    return new_plant

@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant_detail(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    resp = PlantResponse.model_validate(plant)
    resp.analyses_count = len(plant.analyses)
    if plant.analyses:
        latest = sorted(plant.analyses, key=lambda a: a.created_at, reverse=True)[0]
        resp.latest_health_score = latest.health_score
        resp.latest_health_status = latest.health_status
    return resp

@router.get("/{plant_id}/analyses", response_model=List[AnalysisResponse])
def get_plant_analyses(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    analyses = db.query(PlantAnalysis).filter(
        PlantAnalysis.plant_id == plant_id,
        PlantAnalysis.user_id == current_user.id
    ).order_by(PlantAnalysis.created_at.desc()).all()
    
    return analyses

@router.put("/{plant_id}", response_model=PlantResponse)
def update_plant(
    plant_id: int,
    plant_in: PlantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    for field, value in plant_in.model_dump(exclude_unset=True).items():
        setattr(plant, field, value)
        
    db.commit()
    db.refresh(plant)
    return plant

@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    db.delete(plant)
    db.commit()
    return None
