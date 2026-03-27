from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # employee | manager | admin
    department: Optional[str] = None
    doj: Optional[date] = None
    manager_id: Optional[int] = None
    review_track: Optional[str] = "bi_annual"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None
    review_track: Optional[str] = None
    on_leave: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None
    doj: Optional[date] = None
    manager_id: Optional[int] = None
    is_active: bool
    is_first_login: bool
    on_leave: bool
    review_track: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
