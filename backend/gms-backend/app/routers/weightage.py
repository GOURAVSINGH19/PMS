from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.goal import Goal
from app.enums import GoalStatus, GoalTag

router = APIRouter()

@router.get("/users/{user_id}/weightage/{tag}")
def get_remaining_weightage(user_id: int, tag: GoalTag, db: Session = Depends(get_db)):
    """Get remaining weightage % for a user's goals in a specific period"""
    goals = db.query(Goal).filter(
        Goal.assignee_id == user_id,
        Goal.tag == tag,
        Goal.status.in_([GoalStatus.DRAFT, GoalStatus.PENDING_APPROVAL, GoalStatus.ACTIVE])
    ).all()
    
    used_weightage = sum(g.weightage for g in goals)
    remaining = 100 - used_weightage
    
    return {
        "tag": tag,
        "used_weightage": used_weightage,
        "remaining_weightage": remaining,
        "goals_count": len(goals)
    }
