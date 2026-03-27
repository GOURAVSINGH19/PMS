from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from enum import Enum

class PerformanceRating(str, Enum):
    BELOW_EXPECTATIONS = "below_expectations"
    MEETS_EXPECTATIONS = "meets_expectations"
    ABOVE_EXPECTATIONS = "above_expectations"

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False, unique=True)
    rating = Column(SQLEnum(PerformanceRating), nullable=False)
    scored_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    scored_at = Column(DateTime, default=datetime.utcnow)
    
    goal = relationship("Goal", back_populates="score")
