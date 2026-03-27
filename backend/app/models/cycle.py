from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ReviewCycle(Base):
    __tablename__ = "review_cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # e.g. "H1 2026", "Q1 2026"
    track = Column(String, nullable=False) # bi_annual | quarterly
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    trigger_date = Column(Date, nullable=False)
    close_date = Column(Date, nullable=False)
    status = Column(String, default="upcoming") # upcoming | active | closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    enrollments = relationship("CycleEnrollment", back_populates="cycle")
    goals = relationship("Goal", back_populates="cycle")
    feedback_forms = relationship("FeedbackForm", back_populates="cycle")


class CycleEnrollment(Base):
    __tablename__ = "cycle_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("review_cycles.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="enrolled") # enrolled | waived | skipped (deduplicated)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cycle = relationship("ReviewCycle", back_populates="enrollments")
    user = relationship("User")
