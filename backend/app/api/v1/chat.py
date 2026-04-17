from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.qwen_service import qwen_service
from app.schemas.response import ResponseBase

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None

@router.post("/", response_model=ResponseBase[str])
async def chat_with_assistant(request: ChatRequest):
    """
    Send a message to the AI assistant
    """
    try:
        history_dicts = [msg.dict() for msg in request.history] if request.history else None
        response_text = await qwen_service.chat(request.message, history=history_dicts)
        return ResponseBase(data=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
