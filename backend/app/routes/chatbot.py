# backend/app/routers/chatbot.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.witai_service import witai_service
from app.dependencies.auth import get_current_user
from app.models.user_model import UserInDB

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=500, description="User's message")
    session_id: Optional[str] = Field(None, description="Optional session identifier")

class ChatResponse(BaseModel):
    success: bool
    response: str
    intent: Optional[str] = None
    confidence: Optional[float] = None
    entities: Optional[Dict[str, Any]] = None

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_message: ChatMessage,
    current_user = Depends(get_current_user)):

    """
    Send message to TomaBot and get AI response powered by Wit.ai
    
    - **Requires authentication**
    - **Uses Wit.ai for natural language understanding**
    - **Specialized in tomato farming topics**
    - **Redirects off-topic questions**
    
    Returns bot response with detected intent and confidence score.
    """
    try:
        # Validate message
        message_text = chat_message.message.strip()
        
        if not message_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # Use user ID as session if not provided
        session_id = chat_message.session_id or str(current_user.id)
        
        # Send to Wit.ai
        result = await witai_service.send_message(
            message=message_text,
            session_id=session_id
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=result.get("response", "Chatbot service temporarily unavailable")
            )
        
        return ChatResponse(
            success=True,
            response=result["response"],
            intent=result.get("intent"),
            confidence=result.get("confidence"),
            entities=result.get("entities")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chatbot endpoint error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message"
        )

@router.get("/health")
async def chatbot_health():
    """Check if chatbot service is available"""
    return {
        "status": "healthy",
        "service": "TomaBot (Wit.ai)",
        "version": "1.0.0"
    }