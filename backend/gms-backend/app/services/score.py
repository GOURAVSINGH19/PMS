from sqlalchemy.orm import Session
from app.models.score import Score
from app.models.goal import Goal
from app.schemas.score import ScoreCreate
from app.enums import GoalStatus

class ScoreService:
    def score_goal(self, db: Session, goal_id: int, evaluator_id: int, score_data: ScoreCreate) -> Score:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise ValueError("Goal not found")
        if goal.status != GoalStatus.SCORABLE:
            raise ValueError("Goal must have both feedbacks before scoring")
        
        existing_score = db.query(Score).filter(Score.goal_id == goal_id).first()
        if existing_score:
            raise ValueError("Goal already scored")
        
        score = Score(
            goal_id=goal_id,
            rating=score_data.rating,
            scored_by=evaluator_id
        )
        db.add(score)
        
        goal.status = GoalStatus.SCORED
        db.commit()
        db.refresh(score)
        return score

score_service = ScoreService()
