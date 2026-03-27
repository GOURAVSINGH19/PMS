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
        return team_repository.delete(db, team_id)

team_service = TeamService()
