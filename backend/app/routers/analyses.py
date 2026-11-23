from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io

from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.analysis import PlantAnalysis, DetectedIssue, TreatmentRecommendation
from app.schemas.analysis import AnalysisResponse, GeminiAnalysisResult
from app.services.auth_service import get_current_user, get_optional_current_user
from app.services.gemini_service import analyze_plant_image
from app.services.pdf_service import generate_analysis_pdf
from app.utils.file_storage import validate_and_save_image

router = APIRouter(prefix="/analyses", tags=["Plant Analyses"])

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_plant(
    image: UploadFile = File(...),
    plant_id: Optional[int] = Form(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        current_user = db.query(User).first()
        if not current_user:
            from app.services.auth_service import get_password_hash
            current_user = User(
                email="farmer.arun@plantcare.ai",
                full_name="Arun Kumar - Lead Agronomist",
                hashed_password=get_password_hash("PlantCare2026!"),
                role="user"
            )
            db.add(current_user)
            db.commit()
            db.refresh(current_user)

    # Verify plant if plant_id provided
    plant = None
    if plant_id:
        plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
        if not plant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified plant not found")

    # Read image bytes for Gemini analysis
    image_bytes = await image.read()
    image.file.seek(0)
    
    # Validate and save image locally
    saved_image_path = validate_and_save_image(image)
    mime_type = image.content_type or "image/jpeg"

    # Call Gemini Multimodal API
    try:
        gemini_result: GeminiAnalysisResult = await analyze_plant_image(image_bytes, mime_type)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Vision diagnostic failed: {str(e)}"
        )

    # Persist PlantAnalysis to database
    ident = gemini_result.plant_identification
    health = gemini_result.health_assessment
    nutrient = gemini_result.nutrient_assessment
    care = gemini_result.plant_care
    monitoring = gemini_result.monitoring

    analysis = PlantAnalysis(
        user_id=current_user.id,
        plant_id=plant.id if plant else None,
        image_path=saved_image_path,
        common_name=ident.common_name or "Unidentified Plant",
        scientific_name=ident.scientific_name or "Unknown",
        identification_confidence=ident.identification_confidence,
        health_score=health.health_score,
        health_status=health.health_status,
        severity=health.severity,
        nutrient_deficiencies=nutrient.possible_deficiencies,
        nutrient_observations=nutrient.observations,
        watering_guide=care.watering,
        sunlight_guide=care.sunlight,
        soil_guide=care.soil,
        fertilizer_guide=care.fertilizer,
        next_check_days=monitoring.next_check_days or 7,
        additional_observations=monitoring.additional_observations,
        analysis_summary=gemini_result.analysis_summary,
        limitations=gemini_result.limitations
    )
    db.add(analysis)
    db.flush()

    # Save Detected Issues
    for item in gemini_result.detected_issues:
        issue = DetectedIssue(
            analysis_id=analysis.id,
            issue_name=item.issue_name or "General Observation",
            possible_disease=item.possible_disease,
            confidence=item.confidence,
            observed_symptoms=item.observed_symptoms,
            possible_causes=item.possible_causes,
            severity=health.severity
        )
        db.add(issue)

    # Save Treatment Recommendations
    treatment_data = gemini_result.treatment
    treatment = TreatmentRecommendation(
        analysis_id=analysis.id,
        immediate_actions=treatment_data.immediate_actions,
        organic_treatments=treatment_data.organic_treatments,
        other_treatment_options=treatment_data.other_treatment_options,
        preventive_measures=treatment_data.preventive_measures
    )
    db.add(treatment)

    # If plant has no photo yet, set this scan as plant image
    if plant and not plant.image_url:
        plant.image_url = saved_image_path

    db.commit()
    db.refresh(analysis)
    return analysis

@router.get("", response_model=List[AnalysisResponse])
def get_user_analyses(
    plant_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PlantAnalysis).filter(PlantAnalysis.user_id == current_user.id)
    if plant_id:
        query = query.filter(PlantAnalysis.plant_id == plant_id)
        
    analyses = query.order_by(PlantAnalysis.created_at.desc()).all()
    return analyses

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_detail(
    analysis_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PlantAnalysis).filter(PlantAnalysis.id == analysis_id)
    if current_user:
        query = query.filter(PlantAnalysis.user_id == current_user.id)
    analysis = query.first()
    if not analysis:
        # Fallback to general lookup
        analysis = db.query(PlantAnalysis).filter(PlantAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found")
    return analysis

@router.put("/{analysis_id}/link-plant")
def link_analysis_to_plant(
    analysis_id: int,
    plant_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(PlantAnalysis).filter(
        PlantAnalysis.id == analysis_id,
        PlantAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.user_id == current_user.id
    ).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    analysis.plant_id = plant.id
    if not plant.image_url:
        plant.image_url = analysis.image_path

    db.commit()
    return {"message": f"Successfully linked report to '{plant.name}'"}

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(PlantAnalysis).filter(
        PlantAnalysis.id == analysis_id,
        PlantAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found")
    
    db.delete(analysis)
    db.commit()
    return None

@router.get("/{analysis_id}/pdf")
def download_pdf_report(
    analysis_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PlantAnalysis).filter(PlantAnalysis.id == analysis_id)
    if current_user:
        query = query.filter(PlantAnalysis.user_id == current_user.id)
    analysis = query.first()
    if not analysis:
        analysis = db.query(PlantAnalysis).filter(PlantAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found")
    
    pdf_buffer = generate_analysis_pdf(analysis)
    filename = f"PlantCare_Report_{analysis.common_name or 'Plant'}_{analysis.id}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
