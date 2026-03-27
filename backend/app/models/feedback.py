from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class FeedbackForm(Base):
    __tablename__ = "feedback_forms"

    id = Column(Integer, primary_key=True, index=True)
    # Who this form is FOR (the employee being reviewed)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Who fills it in
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    form_type = Column(String, nullable=False)  # self | manager
    context = Column(String, nullable=False)  # probation | bi_annual | quarterly
    cycle_id = Column(Integer, ForeignKey("review_cycles.id"), nullable=True)
    probation_trigger_id = Column(Integer, ForeignKey("probation_triggers.id"), nullable=True)
    responses = Column(JSON, nullable=True)  # {"q1": 3, "q2": 4, "comments": "..."}
    overall_score = Column(Float, nullable=True)
    rating = Column(String, nullable=True)  # below_expectations | meets | above_expectations
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending")  # pending | submitted

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("User", foreign_keys=[employee_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    cycle = relationship("ReviewCycle", back_populates="feedback_forms")
    probation_trigger = relationship("ProbationTrigger", foreign_keys=[probation_trigger_id],
                                     back_populates="employee_form")
    flags = relationship("Flag", back_populates="form")


class Flag(Base):
    __tablename__ = "flags"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("feedback_forms.id"), nullable=False)
    reason = Column(String, nullable=False)  # low_score | negative_sentiment | incomplete | repeat_flag
    status = Column(String, default="open")  # open | reviewed | resolved | escalated
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_notes = Column(String, nullable=True)
    admin_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    auto_escalated = Column(Boolean, default=False)
    escalated_at = Column(DateTime(timezone=True), nullable=True)
    is_repeat = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    form = relationship("FeedbackForm", back_populates="flags")
    admin = relationship("User", foreign_keys=[admin_id])
