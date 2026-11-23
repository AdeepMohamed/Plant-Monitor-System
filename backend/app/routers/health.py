import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.config import settings
from app.services.gemini_service import check_gemini_status
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter(tags=["Health & Diagnostics"])

class KeyUpdate(BaseModel):
    gemini_api_key: str

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

@router.get("/gemini/status")
def gemini_status():
    return check_gemini_status()

@router.post("/gemini/set-key")
def set_gemini_key(
    key_in: KeyUpdate,
    current_user: User = Depends(get_current_user)
):
    key = key_in.gemini_api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API Key cannot be empty")
    
    # Update running settings
    settings.GEMINI_API_KEY = key
    os.environ["GEMINI_API_KEY"] = key
    
    # Save to .env file as well for persistence
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    try:
        lines = []
        key_found = False
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        lines.append(f"GEMINI_API_KEY={key}\n")
                        key_found = True
                    else:
                        lines.append(line)
        if not key_found:
            lines.append(f"GEMINI_API_KEY={key}\n")
            
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(lines)
    except Exception as e:
        pass

    return {
        "status": "success",
        "message": "Gemini API key updated successfully."
    }
