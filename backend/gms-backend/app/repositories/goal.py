from sqlalchemy.orm import joinedload
from app.repositories.base import BaseRepository
from app.models.goal import Goal

class GoalRepository(BaseRepository[Goal]):
    def __init__(self):
        super().__init__(Goal)
    
    def get_by_id(self, db, id: int):
        return db.query(Goal).options(
            joinedload(Goal.creator),
            joinedload(Goal.assignee),
            joinedload(Goal.subtasks)
        ).filter(Goal.id == id).first()
    
    def get_all(self, db, skip: int = 0, limit: int = 100):
        return db.query(Goal).options(
            joinedload(Goal.creator),
            joinedload(Goal.assignee),
            joinedload(Goal.subtasks)
        ).offset(skip).limit(limit).all()

goal_repository = GoalRepository()
