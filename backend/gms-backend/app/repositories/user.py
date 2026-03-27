from app.repositories.base import BaseRepository
from app.models.user import User
from sqlalchemy.orm import Session
from typing import List

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)
    
    def get_all(self, db: Session, skip: int = 0, limit: int = 100, team_id: int = None) -> List[User]:
        query = db.query(self.model)
        
        # Apply team_id filter if provided
        if team_id is not None:
            query = query.filter(User.team_id == team_id)
        
        return query.offset(skip).limit(limit).all()

user_repository = UserRepository()
