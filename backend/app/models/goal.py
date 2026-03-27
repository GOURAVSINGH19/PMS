from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    level = Column(String, nullable=False)  # company | team | individual
    status = Column(String, default="draft")  # draft | pending_approval | active | completed | archived
    weightage = Column(Float, default=0.0)
    completion_pct = Column(Float, default=0.0)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cycle_id = Column(Integer, ForeignKey("review_cycles.id"), nullable=True)
    parent_goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", foreign_keys=[owner_id], back_populates="goals_owned")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="goals_created")
    cycle = relationship("ReviewCycle", back_populates="goals")
    parent_goal = relationship("Goal", remote_side=[id], backref="child_goals")
    approvals = relationship("GoalApproval", back_populates="goal", cascade="all, delete-orphan")


class GoalApproval(Base):
    __tablename__ = "goal_approvals"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # approved | rejected
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    goal = relationship("Goal", back_populates="approvals")
    reviewer = relationship("User")
