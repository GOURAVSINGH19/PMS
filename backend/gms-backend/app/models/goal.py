from sqlalchemy import Column, Integer, String, Text, Date, Float, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base
from app.enums import GoalStatus, GoalLevel, GoalTag, GoalPriority

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    level = Column(SQLEnum(GoalLevel), nullable=False)
    status = Column(SQLEnum(GoalStatus), nullable=False, default=GoalStatus.DRAFT)
    tag = Column(SQLEnum(GoalTag), nullable=False)
    priority = Column(SQLEnum(GoalPriority), nullable=False)
    weightage = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    category = Column(String, nullable=True)
    completion_percentage = Column(Float, default=0.0)
    
    parent_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    parent = relationship("Goal", remote_side="Goal.id", backref="child_goals", foreign_keys=[parent_id])
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_goals")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_goals")
    team = relationship("Team", back_populates="goals")
    
    subtasks = relationship("Subtask", back_populates="goal", cascade="all, delete-orphan")
    progress_updates = relationship("Progress", back_populates="goal", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="goal", cascade="all, delete-orphan")
    score = relationship("Score", back_populates="goal", uselist=False, cascade="all, delete-orphan")
    
    @property
    def days_remaining(self) -> int:
        return (self.due_date - date.today()).days
    
    @property
    def days_elapsed(self) -> int:
        return (date.today() - self.start_date).days
    
    @property
    def total_days(self) -> int:
        return (self.due_date - self.start_date).days
    
    @property
    def time_elapsed_percentage(self) -> float:
        if self.total_days <= 0:
            return 100.0
        return (self.days_elapsed / self.total_days) * 100
    
    @property
    def is_overdue(self) -> bool:
        return date.today() > self.due_date
    
    @property
    def is_at_risk(self) -> bool:
        return self.time_elapsed_percentage > 70 and self.completion_percentage < 50
