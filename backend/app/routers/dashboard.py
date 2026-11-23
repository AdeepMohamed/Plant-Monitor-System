from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.analysis import PlantAnalysis, DetectedIssue
from app.schemas.dashboard import (
    DashboardStatsResponse,
    RecentActivityItem,
    HealthDistributionItem,
    DiseaseSummaryItem
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_plants = db.query(Plant).filter(Plant.user_id == current_user.id).count()
    analyses = db.query(PlantAnalysis).filter(PlantAnalysis.user_id == current_user.id).all()
    total_analyses = len(analyses)

    if total_analyses == 0:
        return DashboardStatsResponse(
            total_plants=total_plants,
            total_analyses=0,
            healthy_plants=0,
            attention_needed=0,
            average_health_score=0.0,
            health_distribution=[
                HealthDistributionItem(name="Excellent (90-100)", value=0, color="#16834A"),
                HealthDistributionItem(name="Good (75-89)", value=0, color="#22C55E"),
                HealthDistributionItem(name="Moderate (50-74)", value=0, color="#F59E0B"),
                HealthDistributionItem(name="Poor (25-49)", value=0, color="#F97316"),
                HealthDistributionItem(name="Critical (0-24)", value=0, color="#DC2626"),
            ],
            disease_summary=[]
        )

    # Health distribution buckets
    excellent_count = 0
    good_count = 0
    moderate_count = 0
    poor_count = 0
    critical_count = 0
    total_score = 0

    for a in analyses:
        score = a.health_score or 0
        total_score += score
        if score >= 90:
            excellent_count += 1
        elif score >= 75:
            good_count += 1
        elif score >= 50:
            moderate_count += 1
        elif score >= 25:
            poor_count += 1
        else:
            critical_count += 1

    healthy_count = excellent_count + good_count
    attention_count = moderate_count + poor_count + critical_count
    avg_score = round(total_score / total_analyses, 1)

    distribution = [
        HealthDistributionItem(name="Excellent (90-100)", value=excellent_count, color="#16834A"),
        HealthDistributionItem(name="Good (75-89)", value=good_count, color="#22C55E"),
        HealthDistributionItem(name="Moderate (50-74)", value=moderate_count, color="#F59E0B"),
        HealthDistributionItem(name="Poor (25-49)", value=poor_count, color="#F97316"),
        HealthDistributionItem(name="Critical (0-24)", value=critical_count, color="#DC2626"),
    ]

    # Aggregate detected diseases
    disease_counts = {}
    for a in analyses:
        for issue in a.detected_issues:
            name = issue.possible_disease or issue.issue_name
            if name and name.lower() not in ("none", "healthy", "n/a"):
                disease_counts[name] = disease_counts.get(name, 0) + 1

    sorted_diseases = sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    disease_summary = [DiseaseSummaryItem(disease=k, count=v) for k, v in sorted_diseases]

    return DashboardStatsResponse(
        total_plants=total_plants,
        total_analyses=total_analyses,
        healthy_plants=healthy_count,
        attention_needed=attention_count,
        average_health_score=avg_score,
        health_distribution=distribution,
        disease_summary=disease_summary
    )

@router.get("/recent-activity", response_model=List[RecentActivityItem])
def get_recent_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recent_analyses = db.query(PlantAnalysis).filter(
        PlantAnalysis.user_id == current_user.id
    ).order_by(PlantAnalysis.created_at.desc()).limit(10).all()

    recent_plants = db.query(Plant).filter(
        Plant.user_id == current_user.id
    ).order_by(Plant.created_at.desc()).limit(5).all()

    activities = []

    for a in recent_analyses:
        plant_name = a.plant.name if a.plant else a.common_name or "Plant Scan"
        activities.append(RecentActivityItem(
            id=a.id,
            type="analysis",
            title=f"Analyzed {plant_name}",
            description=f"Health Score: {a.health_score}/100 • Status: {a.health_status}",
            timestamp=a.created_at,
            status=a.health_status,
            plant_name=plant_name,
            image_url=a.image_path
        ))

    for p in recent_plants:
        activities.append(RecentActivityItem(
            id=p.id,
            type="plant_added",
            title=f"Added '{p.name}' to My Plants",
            description=f"Category: {p.category} • Location: {p.location or 'Not specified'}",
            timestamp=p.created_at,
            status="Active",
            plant_name=p.name,
            image_url=p.image_url
        ))

    # Sort combined activity by timestamp descending
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[:10]
