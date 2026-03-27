from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ProbationRecord(Base):
    """One record per employee tracking overall probation state."""
    __tablename__ = "probation_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    status = Column(String, default="active")  # active | paused | completed | terminated | waived
    effective_doj = Column(Date, nullable=True)  # Adjusted DOJ after backdating
    leave_days_accumulated = Column(Integer, default=0)
    current_manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employee = relationship("User", foreign_keys=[employee_id], back_populates="probation_record")
    current_manager = relationship("User", foreign_keys=[current_manager_id])
    triggers = relationship("ProbationTrigger", back_populates="probation_record")


class ProbationTrigger(Base):
    """Day 30, 60, 80 trigger instances."""
    __tablename__ = "probation_triggers"

    id = Column(Integer, primary_key=True, index=True)
    probation_record_id = Column(Integer, ForeignKey("probation_records.id"), nullable=False)
    day = Column(Integer, nullable=False)  # 30 | 60 | 80
    scheduled_date = Column(Date, nullable=True)
    triggered_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending")  # pending | sent | cancelled | waived
    reminder_count = Column(Integer, default=0)
    escalated_to_admin = Column(Boolean, default=False)
    escalated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    probation_record = relationship("ProbationRecord", back_populates="triggers")
    employee_form = relationship("FeedbackForm", foreign_keys="FeedbackForm.probation_trigger_id",
                                  primaryjoin="ProbationTrigger.id == FeedbackForm.probation_trigger_id",
                                  back_populates="probation_trigger")


class LeaveRecord(Base):
    """Leave periods for working-day calculation."""
    __tablename__ = "leave_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="active")  # active | ended
    leave_type = Column(String, default="general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
