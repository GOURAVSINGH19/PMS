from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date, datetime


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    level: str  # company | team | individual
    weightage: Optional[float] = 0.0
    owner_id: Optional[int] = None
    cycle_id: Optional[int] = None
    parent_goal_id: Optional[int] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    weightage: Optional[float] = None
    completion_pct: Optional[float] = None


class GoalApprovalAction(BaseModel):
    action: str  # approved | rejected
    comment: Optional[str] = None
    weightage: Optional[float] = None


class GoalOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    level: str
    status: str
    weightage: float
    completion_pct: float
    owner_id: int
    creator_id: int
    cycle_id: Optional[int] = None
    parent_goal_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
