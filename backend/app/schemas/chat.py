from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[int] = None
    plant_id: Optional[int] = None

class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
