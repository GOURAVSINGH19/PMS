from pydantic import BaseModel
from typing import Optional

class TeamBase(BaseModel):
    name: str
    manager_id: int | None = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: str | None = None
    manager_id: int | None = None

class ManagerInfo(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True

class Team(TeamBase):
    id: int
    manager: Optional[ManagerInfo] = None
    
    class Config:
        from_attributes = True
