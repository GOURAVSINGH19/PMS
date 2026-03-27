from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class FeedbackSubmit(BaseModel):
    responses: Dict[str, Any]
    overall_score: Optional[float] = None
    rating: Optional[str] = None  # below_expectations | meets | above_expectations


class FeedbackFormOut(BaseModel):
    id: int
    employee_id: int
    reviewer_id: int
    form_type: str
    context: str
    cycle_id: Optional[int] = None
    probation_trigger_id: Optional[int] = None
    responses: Optional[Dict[str, Any]] = None
    overall_score: Optional[float] = None
    rating: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FlagOut(BaseModel):
    id: int
    form_id: int
    reason: str
    status: str
    admin_id: Optional[int] = None
    admin_notes: Optional[str] = None
    admin_reviewed_at: Optional[datetime] = None
    auto_escalated: bool
    is_repeat: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FlagAction(BaseModel):
    status: str  # reviewed | resolved | escalated
    notes: Optional[str] = None
