from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Any
from app.enums import ProbationStatus, ProbationTriggerStatus, ProbationFeedbackType


class ProbationRecordCreate(BaseModel):
    employee_id: int
    date_of_joining: date


class ProbationFeedbackCreate(BaseModel):
    feedback_type: ProbationFeedbackType
    form_data: dict


class ProbationFeedbackResponse(BaseModel):
    id: int
    probation_trigger_id: int
    submitted_by_id: int
    feedback_type: ProbationFeedbackType
    form_data: Any
    is_flagged: bool
    flag_reason: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True


class ProbationTriggerResponse(BaseModel):
    id: int
    probation_record_id: int
    trigger_day: int
    trigger_date: date
    status: ProbationTriggerStatus
    created_at: datetime
    feedbacks: List[ProbationFeedbackResponse] = []

    class Config:
        from_attributes = True


class ProbationRecordResponse(BaseModel):
    id: int
    employee_id: int
    date_of_joining: date
    probation_status: ProbationStatus
    is_paused: bool
    pause_start_date: Optional[date] = None
    pause_resume_date: Optional[date] = None
    created_at: datetime
    triggers: List[ProbationTriggerResponse] = []
    working_days_elapsed: Optional[int] = None

    class Config:
        from_attributes = True


class ProbationPauseRequest(BaseModel):
    pause_date: date


class ProbationResumeRequest(BaseModel):
    resume_date: date
