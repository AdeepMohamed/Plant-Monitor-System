from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )
except Exception as e:
    logger.warning(f"Failed to connect to primary DB ({db_url}): {e}. Falling back to SQLite.")
    engine = create_engine("sqlite:///./plantcare.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import app.models
    Base.metadata.create_all(bind=engine)
    seed_demo_data()

def seed_demo_data():
    """Seeds demo user, crop profiles, and sample diagnostic analysis if database is empty."""
    db = SessionLocal()
    try:
        from app.models.user import User
        from app.models.plant import Plant
        from app.models.analysis import PlantAnalysis, DetectedIssue, TreatmentRecommendation
        from app.services.auth_service import get_password_hash
        from datetime import datetime, timedelta

        existing_user = db.query(User).filter(User.email == "farmer.arun@plantcare.ai").first()
        if not existing_user:
            demo_user = User(
                email="farmer.arun@plantcare.ai",
                full_name="Arun Kumar (Lead Agronomist)",
                hashed_password=get_password_hash("PlantCare2026!"),
                role="user"
            )
            db.add(demo_user)
            db.flush()

            # Seed plants
            plant1 = Plant(
                user_id=demo_user.id,
                name="Heirloom Beefsteak Tomato",
                species="Solanum lycopersicum",
                category="Vegetable",
                planting_date="2026-03-15",
                location="South Garden Bed #2",
                watering_frequency="Every 2 days (deep root soak)",
                sunlight_requirement="Full Sun (6-8 hours daily)",
                image_url="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=80",
                notes="Organic compost mulch applied. High yield variety."
            )
            plant2 = Plant(
                user_id=demo_user.id,
                name="Basmati Paddy Field",
                species="Oryza sativa",
                category="Grain",
                planting_date="2026-04-01",
                location="River Valley Plot A",
                watering_frequency="Submerged / Controlled irrigation",
                sunlight_requirement="Direct sunlight",
                image_url="https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80",
                notes="Monitored for early stem borer and blast prevention."
            )
            plant3 = Plant(
                user_id=demo_user.id,
                name="Fiddle Leaf Fig",
                species="Ficus lyrata",
                category="Houseplant",
                planting_date="2025-10-10",
                location="Veranda Living Area",
                watering_frequency="Once every 7-10 days",
                sunlight_requirement="Bright indirect light",
                image_url="https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80",
                notes="Sensitive to direct harsh noon sun. Mist leaves occasionally."
            )
            db.add_all([plant1, plant2, plant3])
            db.flush()

            # Seed sample diagnostic history
            analysis1 = PlantAnalysis(
                user_id=demo_user.id,
                plant_id=plant1.id,
                image_path=plant1.image_url,
                common_name="Tomato",
                scientific_name="Solanum lycopersicum",
                identification_confidence=0.96,
                health_score=88,
                health_status="Good",
                severity="Low",
                nutrient_deficiencies=["Slight Potassium"],
                nutrient_observations="Vibrant green foliage with minor margin curling on older leaves.",
                watering_guide="Maintain 2 inches of moisture, avoiding foliage wetting.",
                sunlight_guide="6-8 hours direct morning sunlight.",
                soil_guide="Well-aerated loamy soil with pH 6.2 - 6.8.",
                fertilizer_guide="Apply organic seaweed extract or potassium-rich compost tea biweekly.",
                next_check_days=7,
                additional_observations=["Inspect leaf undersides for aphid colonies during hot afternoons."],
                analysis_summary="Plant demonstrates strong structural vigor and healthy vegetative growth. Marginal chlorosis indicative of mild potassium deficit, manageable via organic top-dressing.",
                limitations=["Visual assessment cannot verify soil fungal spore counts."],
                created_at=datetime.utcnow() - timedelta(days=6)
            )
            db.add(analysis1)
            db.flush()

            # Issues & Treatment
            issue1 = DetectedIssue(
                analysis_id=analysis1.id,
                issue_name="Mild Potassium Deficit",
                possible_disease="None (Physiological)",
                confidence=0.89,
                observed_symptoms=["Slight yellowing along outer leaf margins", "Older leaves exhibit mild curling"],
                possible_causes=["Rapid vegetative growth phase", "Leaching after heavy rain"],
                severity="Low"
            )
            treatment1 = TreatmentRecommendation(
                analysis_id=analysis1.id,
                immediate_actions=["Apply wood ash or potassium sulfate amendment to root perimeter."],
                organic_treatments=["Compost tea enriched with banana peel ferment or liquid kelp."],
                other_treatment_options=["Water-soluble NPK 5-5-15 at half recommended dosage."],
                preventive_measures=["Mulch with straw to retain soil moisture and reduce potassium leaching."]
            )
            db.add_all([issue1, treatment1])

            # Recent follow-up analysis showing improvement
            analysis2 = PlantAnalysis(
                user_id=demo_user.id,
                plant_id=plant1.id,
                image_path=plant1.image_url,
                common_name="Tomato",
                scientific_name="Solanum lycopersicum",
                identification_confidence=0.98,
                health_score=94,
                health_status="Excellent",
                severity="None",
                nutrient_deficiencies=[],
                nutrient_observations="Foliage fully recovered, uniform deep green hue across upper and lower canopy.",
                watering_guide="Maintain steady drip irrigation cycle.",
                sunlight_guide="Full sun.",
                soil_guide="Healthy microbial soil activity.",
                fertilizer_guide="Standard balanced vermicompost every 3 weeks.",
                next_check_days=10,
                additional_observations=["First flower clusters forming nicely."],
                analysis_summary="Outstanding recovery following potassium top dressing. Leaf margins normalized with zero signs of pathogen invasion.",
                limitations=["Visual indicative assessment."],
                created_at=datetime.utcnow() - timedelta(days=1)
            )
            db.add(analysis2)
            db.flush()

            treatment2 = TreatmentRecommendation(
                analysis_id=analysis2.id,
                immediate_actions=["Stake vines to support upcoming fruit clusters."],
                organic_treatments=["Continue bi-weekly compost tea application."],
                other_treatment_options=[],
                preventive_measures=["Prune sucker shoots for improved aeration."]
            )
            db.add(treatment2)

            db.commit()
            logger.info("Demo user, sample crops, and historical analyses seeded successfully.")
    except Exception as e:
        db.rollback()
        logger.warning(f"Seed data note: {e}")
    finally:
        db.close()
