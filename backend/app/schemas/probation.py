from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ProbationTriggerOut(BaseModel):
    id: int
    day: int
    scheduled_date: Optional[date] = None
    triggered_at: Optional[datetime] = None
    status: str
    reminder_count: int
    escalated_to_admin: bool

    class Config:
        from_attributes = True


class ProbationOut(BaseModel):
    id: int
    employee_id: int
    status: str
    effective_doj: Optional[date] = None
    leave_days_accumulated: int
    current_manager_id: Optional[int] = None
    triggers: List[ProbationTriggerOut] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeaveCreate(BaseModel):
    start_date: date
    leave_type: Optional[str] = "general"
