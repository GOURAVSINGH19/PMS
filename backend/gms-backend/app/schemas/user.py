from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from app.enums import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    manager_id: int | None = None
    team_id: int | None = None
    department: str | None = None
    date_of_joining: date | None = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    role: UserRole | None = None
    manager_id: int | None = None
    team_id: int | None = None
    department: str | None = None
    date_of_joining: date | None = None
    is_active: bool | None = None

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True
