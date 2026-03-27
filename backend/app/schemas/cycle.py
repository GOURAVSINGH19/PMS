from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date, datetime


class CycleCreate(BaseModel):
    name: str
    track: str  # bi_annual | quarterly
    period_start: date
    period_end: date
    trigger_date: date
    close_date: date
    status: Optional[str] = "upcoming"


class CycleOut(BaseModel):
    id: int
    name: str
    track: str
    period_start: date
    period_end: date
    trigger_date: date
    close_date: date
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EnrollmentOut(BaseModel):
    id: int
    cycle_id: int
    user_id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
