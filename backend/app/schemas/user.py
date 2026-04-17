from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    
    # Profile & Medical Info
    age: Optional[str] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    family_history: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

# Properties to return to client
class User(UserInDBBase):
    pass

# Properties properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
