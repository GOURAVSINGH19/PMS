from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.enums import ProbationStatus, ProbationTriggerStatus, ProbationFeedbackType


class ProbationRecord(Base):
    __tablename__ = "probation_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    date_of_joining = Column(Date, nullable=False)
    probation_status = Column(SQLEnum(ProbationStatus), nullable=False, default=ProbationStatus.IN_PROBATION)
    is_paused = Column(Boolean, default=False)
    pause_start_date = Column(Date, nullable=True)
    pause_resume_date = Column(Date, nullable=True)
    recommendation = Column(String, nullable=True)  # confirm | extend | terminate | needs_improvement
    recommendation_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("User", foreign_keys=[employee_id])
    triggers = relationship("ProbationTrigger", back_populates="record", cascade="all, delete-orphan")


class ProbationTrigger(Base):
    __tablename__ = "probation_triggers"

    id = Column(Integer, primary_key=True, index=True)
    probation_record_id = Column(Integer, ForeignKey("probation_records.id"), nullable=False)
    trigger_day = Column(Integer, nullable=False)   # 30, 60, or 80
    trigger_date = Column(Date, nullable=False)
    status = Column(SQLEnum(ProbationTriggerStatus), nullable=False, default=ProbationTriggerStatus.TRIGGERED)
    created_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("ProbationRecord", back_populates="triggers")
    feedbacks = relationship("ProbationFeedback", back_populates="trigger", cascade="all, delete-orphan")
    reminders = relationship("ProbationReminder", back_populates="trigger", cascade="all, delete-orphan")


class ProbationFeedback(Base):
    __tablename__ = "probation_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    probation_trigger_id = Column(Integer, ForeignKey("probation_triggers.id"), nullable=False)
    submitted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_type = Column(SQLEnum(ProbationFeedbackType), nullable=False)
    form_data = Column(JSON, nullable=False)
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    trigger = relationship("ProbationTrigger", back_populates="feedbacks")
    submitted_by = relationship("User", foreign_keys=[submitted_by_id])


class ProbationReminder(Base):
    __tablename__ = "probation_reminders"

    id = Column(Integer, primary_key=True, index=True)
    probation_trigger_id = Column(Integer, ForeignKey("probation_triggers.id"), nullable=False)
    reminder_count = Column(Integer, default=0)
    reminder_sent_at = Column(DateTime, default=datetime.utcnow)
    next_reminder_at = Column(DateTime, nullable=True)

    trigger = relationship("ProbationTrigger", back_populates="reminders")
