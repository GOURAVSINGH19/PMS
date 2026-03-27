from pydantic import BaseModel, EmailStr
from app.enums import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    manager_id: int | None = None
    team_id: int | None = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    role: UserRole | None = None
    manager_id: int | None = None
    team_id: int | None = None

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True
