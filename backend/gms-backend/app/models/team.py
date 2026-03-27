from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    manager = relationship("User", foreign_keys=[manager_id])
    members = relationship("User", back_populates="team", foreign_keys="User.team_id")
    goals = relationship("Goal", back_populates="team")
