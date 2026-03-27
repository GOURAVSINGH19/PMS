from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # employee | manager | admin
    department = Column(String, nullable=True)
    doj = Column(Date, nullable=True)  # Date of Joining
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_first_login = Column(Boolean, default=True)
    on_leave = Column(Boolean, default=False)
    leave_days_accumulated = Column(Integer, default=0)
    review_track = Column(String, default="bi_annual")  # bi_annual | quarterly | both
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    manager = relationship("User", remote_side=[id], foreign_keys=[manager_id], backref="direct_reports")
    goals_owned = relationship("Goal", foreign_keys="Goal.owner_id", back_populates="owner")
    goals_created = relationship("Goal", foreign_keys="Goal.creator_id", back_populates="creator")
    notifications = relationship("Notification", back_populates="user")
    probation_record = relationship("ProbationRecord", back_populates="employee", uselist=False)
