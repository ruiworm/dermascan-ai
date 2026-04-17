from pydantic import BaseModel
from typing import Any, Optional, Generic, TypeVar

T = TypeVar("T")

class ResponseBase(BaseModel, Generic[T]):
    success: bool = True
    code: int = 200
    message: str = "success"
    data: Optional[T] = None

class ErrorResponse(BaseModel):
    success: bool = False
    code: int = 400
    message: str
    details: Optional[Any] = None

class PaginatedResponse(ResponseBase[T], Generic[T]):
    total: int = 0
    page: int = 1
    size: int = 10
