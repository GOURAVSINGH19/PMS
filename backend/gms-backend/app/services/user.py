from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.user import user_repository
from app.schemas.user import UserCreate, UserUpdate, User
from app.auth import hash_password
from app.models.team import Team
from app.enums import UserRole

class UserService:
    def create_user(self, db: Session, user_data: UserCreate) -> User:
        password_hash = hash_password(user_data.password)
        user_dict = user_data.model_dump(exclude={"password"})
        user = user_repository.create(db, password_hash=password_hash, **user_dict)
        
        # Auto-assign as team manager if role is manager/admin and team has no manager
        if user.team_id and user.role in [UserRole.MANAGER, UserRole.ADMIN]:
            team = db.query(Team).filter(Team.id == user.team_id).first()
            if team and not team.manager_id:
                team.manager_id = user.id
                db.commit()
        
        return user
    
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        return user_repository.get_by_id(db, user_id)
    
    def get_users(self, db: Session, skip: int = 0, limit: int = 100, team_id: int = None) -> List[User]:
        return user_repository.get_all(db, skip, limit, team_id=team_id)
    
    def update_user(self, db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        db_user = user_repository.get_by_id(db, user_id)
        if not db_user:
            return None
        return user_repository.update(db, db_user, **user_data.model_dump(exclude_unset=True))
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        return user_repository.delete(db, user_id)

user_service = UserService()
