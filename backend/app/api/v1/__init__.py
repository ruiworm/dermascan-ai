from fastapi import APIRouter
from . import user, analysis, history, chat, admin, knowledge

api_router = APIRouter()
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
