from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.config import settings
from app.schemas.user import User as UserSchema, UserCreate, Token, UserUpdate
from app.utils.security import create_access_token, verify_password
from app.services import user_service

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """Create new user."""
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
        
    user_by_name = user_service.get_user_by_username(db, username=user_in.username)
    if user_by_name:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = user_service.create_user(db, user=user_in)
    return user

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests"""
    user = user_service.get_user_by_username(db, username=form_data.username)
    # Fallback to email if username search fails (common in OAuth2 forms)
    if not user:
        user = user_service.get_user_by_email(db, email=form_data.username)
        
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

from app.core.deps import get_db, get_current_user 
@router.get("/me", response_model=UserSchema)
def read_users_me(
    current_user: UserSchema = Depends(get_current_user)
) -> Any:
    """Get current user."""
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: UserSchema = Depends(get_current_user),
) -> Any:
    """Update current user profile information."""
    user = user_service.update_user(db, db_user=current_user, user_in=user_in)
    return user
