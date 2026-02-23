# backend/app/routers/chatbot_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.gemini_service import gemini_service
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    conversation_history: Optional[List[ConversationMessage]] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    is_tomato_related: Optional[bool] = None
    # Kept for frontend compatibility with the old Wit.ai response shape
    intent: Optional[str] = None
    confidence: Optional[float] = None
    entities: Optional[dict] = None


@router.post("/message", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),  # remove if auth not required
):
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    # Convert history to plain dicts for the service
    history = (
        [{"role": m.role, "content": m.content} for m in request.conversation_history]
        if request.conversation_history
        else None
    )

    result = await gemini_service.send_message(
        message=request.message.strip(),
        conversation_history=history,
        session_id=request.session_id,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result.get("error", "Chatbot service unavailable."),
        )

    return ChatResponse(
        success=True,
        response=result["response"],
        is_tomato_related=result.get("is_tomato_related"),
        # These fields are null now since Claude doesn't use Wit.ai intents,
        # but kept for frontend backward compatibility
        intent=None,
        confidence=None,
        entities=None,
    )


@router.get("/health")
async def health():
    return {"status": "healthy", "model": "gemini-1.5-flash"}