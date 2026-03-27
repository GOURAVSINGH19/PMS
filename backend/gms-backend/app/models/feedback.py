from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from enum import Enum

class FeedbackType(str, Enum):
    MEMBER = "member"
    EVALUATOR = "evaluator"

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_type = Column(SQLEnum(FeedbackType), nullable=False)
    
    # Member feedback fields
    deliverables = Column(Text, nullable=True)
    improvements = Column(Text, nullable=True)
    
    # Evaluator feedback fields
    quality_rating = Column(Integer, nullable=True)
    timeliness_rating = Column(Integer, nullable=True)
    innovation_rating = Column(Integer, nullable=True)
    collaboration_rating = Column(Integer, nullable=True)
    impact_rating = Column(Integer, nullable=True)
    evaluator_comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    goal = relationship("Goal", back_populates="feedbacks")
