from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatSessionCreate
)
from app.services.auth_service import get_current_user
from app.services.gemini_service import ask_plant_assistant

router = APIRouter(prefix="/chat", tags=["Plant Care Assistant"])

@router.post("", response_model=dict)
async def send_chat_message(
    chat_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Get or create session
    session = None
    if chat_in.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == chat_in.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        
    if not session:
        # Title can be derived from the first query
        first_query = chat_in.message.strip()
        title = (first_query[:40] + "...") if len(first_query) > 40 else first_query
        session = ChatSession(user_id=current_user.id, title=title)
        db.add(session)
        db.commit()
        db.refresh(session)

    # 2. Plant context if specified
    plant_context = None
    if chat_in.plant_id:
        plant = db.query(Plant).filter(
            Plant.id == chat_in.plant_id,
            Plant.user_id == current_user.id
        ).first()
        if plant:
            plant_context = (
                f"Plant Profile: Name: '{plant.name}', Species: '{plant.species or 'Unknown'}', "
                f"Category: '{plant.category}', Location: '{plant.location or 'Unknown'}', "
                f"Watering: '{plant.watering_frequency}', Sunlight: '{plant.sunlight_requirement}'. "
                f"User Notes: '{plant.notes or 'None'}'"
            )

    # 3. Fetch past messages for context
    history_records = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()

    chat_history = [{"role": msg.role, "content": msg.content} for msg in history_records]

    # 4. Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=chat_in.message)
    db.add(user_msg)
    db.commit()

    # 5. Call Gemini Assistant
    try:
        reply_text = await ask_plant_assistant(
            prompt=chat_in.message,
            chat_history=chat_history,
            context=plant_context
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Assistant error: {str(e)}")

    # 6. Save assistant message
    bot_msg = ChatMessage(session_id=session.id, role="assistant", content=reply_text)
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return {
        "session_id": session.id,
        "reply": reply_text,
        "user_message_id": user_msg.id,
        "assistant_message_id": bot_msg.id,
        "created_at": bot_msg.created_at.isoformat()
    }

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()
    return sessions

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    session_in: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = ChatSession(
        user_id=current_user.id,
        title=session_in.title or "New Plant Care Conversation"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session_detail(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return session

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    db.delete(session)
    db.commit()
    return None
