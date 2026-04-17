import os

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.api.v1 import api_router
from app.config import settings
from app.core.exceptions import (
    log_requests_middleware, 
    validation_exception_handler, 
    generic_exception_handler,
    logger
)
from app.core.deps import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up 肤理通 API...")
    
    # Initialize default admin user if none exists
    from app.models.database import SessionLocal
    from app.models.user import User
    from app.utils.security import get_password_hash
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.is_superuser == True).first()
        if not admin_user:
            admin_username = os.environ.get("ADMIN_USERNAME", "admin")
            admin_email = os.environ.get("ADMIN_EMAIL", "admin@dermascan.ai")
            admin_password = os.environ.get("ADMIN_PASSWORD", "changeme123")
            logger.info(f"Initializing default admin user: {admin_username}")
            new_admin = User(
                username=admin_username,
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                is_active=True,
                is_superuser=True
            )
            db.add(new_admin)
            db.commit()
    except Exception as e:
        logger.error(f"Failed to initialize admin user: {e}")
    finally:
        db.close()

    # Pre-load AI Models to avoid cold-start latency
    try:
        from app.services.dermfm_service import dermfm_service
        from app.services.rag_service import rag_service
        import anyio
        
        logger.info("Pre-loading AI models (DermFM & RAG Embedding)...")
        # Run loading in background threads to not block the main startup too much if needed, 
        # although lifespan wait is fine.
        await anyio.to_thread.run_sync(dermfm_service.load_model)
        await anyio.to_thread.run_sync(rag_service._initialize)
        logger.info("AI models pre-loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to pre-load AI models: {e}")

    yield
    # Shutdown logic
    logger.info("Shutting down 肤理通 API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for skin analysis, health advice, and user management",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI (default)
    redoc_url="/redoc", # ReDoc UI
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# API Router Setup
app.include_router(api_router, prefix=settings.API_V1_STR)

import os

class CustomStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        return await super().get_response(path, scope)

# Mount static files for temp images
static_dir = os.path.join(settings.KNOWLEDGE_BASE_DIR, "temp")
if os.path.exists(static_dir):
    app.mount("/api/v1/static", CustomStaticFiles(directory=static_dir), name="static")

# Also mount /temp for backward compatibility with existing DB records
app.mount("/temp", CustomStaticFiles(directory=static_dir), name="temp")

# Health Check Endpoint
@app.get("/health", tags=["system"])
def health_check(db: Session = Depends(get_db)):
    """
    Check API and database health status.
    """
    try:
        # Simple DB check (SQLAlchemy 2.x requires text() for raw SQL)
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "failed"
        
    return {
        "status": "ok",
        "database": db_status,
        "version": app.version,
        "environment": settings.ENV
    }

@app.get("/", include_in_schema=False)
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs"
    }
