from pydantic import BaseModel
from app.enums import FeedbackType
from typing import Optional
from datetime import datetime

class MemberFeedbackCreate(BaseModel):
    deliverables: str
    improvements: str

class EvaluatorFeedbackCreate(BaseModel):
    quality_rating: int
    timeliness_rating: int
    innovation_rating: int
    collaboration_rating: int
    impact_rating: int
    evaluator_comment: str

class Feedback(BaseModel):
    id: int
    goal_id: int
    user_id: int
    feedback_type: FeedbackType
    deliverables: Optional[str] = None
    improvements: Optional[str] = None
    quality_rating: Optional[int] = None
    timeliness_rating: Optional[int] = None
    innovation_rating: Optional[int] = None
    collaboration_rating: Optional[int] = None
    impact_rating: Optional[int] = None
    evaluator_comment: Optional[str] = None
    
    class Config:
        from_attributes = True
