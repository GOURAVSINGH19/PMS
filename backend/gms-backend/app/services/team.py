from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.team import team_repository
from app.schemas.team import TeamCreate, TeamUpdate, Team

class TeamService:
    def create_team(self, db: Session, team_data: TeamCreate) -> Team:
        return team_repository.create(db, **team_data.model_dump())
    
    def get_team(self, db: Session, team_id: int) -> Optional[Team]:
        return team_repository.get_by_id(db, team_id)
    
    def get_teams(self, db: Session, skip: int = 0, limit: int = 100) -> List[Team]:
        return team_repository.get_all(db, skip, limit)
    
    def update_team(self, db: Session, team_id: int, team_data: TeamUpdate) -> Optional[Team]:
        db_team = team_repository.get_by_id(db, team_id)
        if not db_team:
            return None
        return team_repository.update(db, db_team, **team_data.model_dump(exclude_unset=True))
    
    def delete_team(self, db: Session, team_id: int) -> bool:
        # Check if team has active users
        from app.models.user import User
        active_users = db.query(User).filter(
            User.team_id == team_id,
            User.is_active == True
        ).count()
        
        if active_users > 0:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete team with {active_users} active user(s). Please reassign or deactivate users first."
            )
        
        return team_repository.delete(db, team_id)

team_service = TeamService()
