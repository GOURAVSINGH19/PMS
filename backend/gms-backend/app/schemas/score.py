from pydantic import BaseModel
from app.enums import PerformanceRating

class ScoreCreate(BaseModel):
    rating: PerformanceRating

class Score(BaseModel):
    id: int
    goal_id: int
    rating: PerformanceRating
    scored_by: int
    
    class Config:
        from_attributes = True
