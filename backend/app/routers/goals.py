from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.goal import Goal, GoalApproval
from app.models.notification import Notification
from app.schemas.goal import GoalCreate, GoalOut, GoalUpdate, GoalApprovalAction
from datetime import datetime

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/", response_model=GoalOut, status_code=201)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = Goal(
        title=payload.title,
        description=payload.description,
        level=payload.level,
        weightage=payload.weightage or 0.0,
        owner_id=payload.owner_id or current_user.id,
        creator_id=current_user.id,
        cycle_id=payload.cycle_id,
        parent_goal_id=payload.parent_goal_id,
        status="draft",
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/", response_model=List[GoalOut])
def list_goals(
    status: str = None,
    level: str = None,
    owner_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Goal)
    if current_user.role == "employee":
        q = q.filter(Goal.owner_id == current_user.id)
    elif current_user.role == "manager":
        # Own goals + direct reports' goals
        report_ids = [u.id for u in db.query(User).filter(User.manager_id == current_user.id).all()]
        report_ids.append(current_user.id)
        q = q.filter(Goal.owner_id.in_(report_ids))
    # admin sees all
    if status:
        q = q.filter(Goal.status == status)
    if level:
        q = q.filter(Goal.level == level)
    if owner_id:
        q = q.filter(Goal.owner_id == owner_id)
    return q.order_by(Goal.created_at.desc()).all()


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if current_user.role == "employee" and goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return goal


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    # Only owner or manager/admin can edit
    if current_user.role == "employee" and goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    # Once submitted for approval, employees can't edit (unless rejected)
    if current_user.role == "employee" and goal.status not in ("draft", "rejected"):
        raise HTTPException(status_code=400, detail="Cannot edit goal in current status")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/{goal_id}/submit", response_model=GoalOut)
def submit_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only goal owner can submit")
    if goal.status not in ("draft",):
        raise HTTPException(status_code=400, detail="Goal must be in draft status to submit")
    goal.status = "pending_approval"
    # Notify manager and admins
    manager = db.query(User).filter(User.id == current_user.manager_id).first()
    if manager:
        db.add(Notification(user_id=manager.id, title="Goal Approval Needed",
                            body=f"{current_user.name} submitted a goal for approval: {goal.title}",
                            category="goal", action_url=f"/goals/{goal_id}"))
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/{goal_id}/approve", response_model=GoalOut)
def approve_reject_goal(
    goal_id: int,
    action: GoalApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager", "admin"))
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.status != "pending_approval":
        raise HTTPException(status_code=400, detail="Goal is not pending approval")

    approval = GoalApproval(
        goal_id=goal.id,
        reviewer_id=current_user.id,
        action=action.action,
        comment=action.comment,
    )
    db.add(approval)

    if action.action == "approved":
        goal.status = "active"
        if action.weightage is not None:
            goal.weightage = action.weightage
        notif_body = f"Your goal '{goal.title}' has been approved!"
    else:
        goal.status = "draft"
        notif_body = f"Your goal '{goal.title}' was rejected. Reason: {action.comment or 'No reason given'}"

    db.add(Notification(user_id=goal.owner_id, title=f"Goal {action.action.capitalize()}",
                        body=notif_body, category="goal", action_url=f"/goals/{goal_id}"))
    db.commit()
    db.refresh(goal)
    return goal


@router.patch("/{goal_id}/completion", response_model=GoalOut)
def update_completion(
    goal_id: int,
    completion_pct: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if current_user.role == "employee" and goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if goal.status != "active":
        raise HTTPException(status_code=400, detail="Can only update completion on active goals")
    goal.completion_pct = max(0.0, min(100.0, completion_pct))
    if goal.completion_pct == 100.0:
        goal.status = "completed"
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}/archive")
def archive_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager", "admin"))
):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.status = "archived"
    db.commit()
    return {"message": "Goal archived"}
