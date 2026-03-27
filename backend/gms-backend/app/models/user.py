from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base
from app.enums import UserRole

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.MEMBER)
    
    # Hierarchy: who is this user's manager/approver
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    # Relationships
    manager = relationship("User", remote_side=[id], backref="subordinates")
    team = relationship("Team", back_populates="members", foreign_keys=[team_id])
    created_goals = relationship("Goal", back_populates="creator", foreign_keys="Goal.creator_id")
    assigned_goals = relationship("Goal", back_populates="assignee", foreign_keys="Goal.assignee_id")
