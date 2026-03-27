from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.goal import Goal
from app.models.feedback import FeedbackForm, Flag
from app.models.probation import ProbationRecord, ProbationTrigger
from app.models.cycle import ReviewCycle, CycleEnrollment
from app.models.notification import Notification

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Main admin command-center data."""
    total_employees = db.query(User).filter(User.role == "employee", User.is_active == True).count()
    total_managers = db.query(User).filter(User.role == "manager", User.is_active == True).count()
    
    # Goals stats
    goals_pending = db.query(Goal).filter(Goal.status == "pending_approval").count()
    goals_active = db.query(Goal).filter(Goal.status == "active").count()
    goals_stalled = db.query(Goal).filter(
        Goal.status == "pending_approval",
        Goal.created_at < datetime.utcnow() - timedelta(days=5)
    ).count()

    # Feedback stats
    forms_total = db.query(FeedbackForm).count()
    forms_submitted = db.query(FeedbackForm).filter(FeedbackForm.status == "submitted").count()
    completion_rate = round((forms_submitted / forms_total * 100) if forms_total else 0, 1)

    # Flags
    open_flags = db.query(Flag).filter(Flag.status == "open").count()
    escalated_flags = db.query(Flag).filter(Flag.status == "escalated").count()
    aging_flags = db.query(Flag).filter(
        Flag.status == "open",
        Flag.created_at < datetime.utcnow() - timedelta(days=5)
    ).count()

    # Probation
    active_probation = db.query(ProbationRecord).filter(ProbationRecord.status == "active").count()
    paused_probation = db.query(ProbationRecord).filter(ProbationRecord.status == "paused").count()
    no_manager_employees = db.query(User).filter(
        User.role == "employee",
        User.manager_id == None,
        User.is_active == True
    ).count()

    # Active cycle
    active_cycle = db.query(ReviewCycle).filter(ReviewCycle.status == "active").first()

    return {
        "overview": {
            "total_employees": total_employees,
            "total_managers": total_managers,
        },
        "goals": {
            "pending_approval": goals_pending,
            "active": goals_active,
            "stalled_approvals": goals_stalled,
        },
        "feedback": {
            "total_forms": forms_total,
            "submitted": forms_submitted,
            "completion_rate": completion_rate,
        },
        "flags": {
            "open": open_flags,
            "escalated": escalated_flags,
            "aging_gt_5_days": aging_flags,
        },
        "probation": {
            "active": active_probation,
            "paused": paused_probation,
            "no_manager_assigned": no_manager_employees,
        },
        "active_cycle": {
            "id": active_cycle.id if active_cycle else None,
            "name": active_cycle.name if active_cycle else None,
            "close_date": str(active_cycle.close_date) if active_cycle else None,
        }
    }


@router.get("/flags/aging")
def get_aging_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    threshold = datetime.utcnow() - timedelta(days=7)
    flags = db.query(Flag).filter(Flag.status == "open", Flag.created_at < threshold).all()
    return [{"id": f.id, "reason": f.reason, "age_days": (datetime.utcnow() - f.created_at.replace(tzinfo=None)).days} for f in flags]


@router.get("/no-manager")
def employees_without_manager(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    users = db.query(User).filter(User.role == "employee", User.manager_id == None, User.is_active == True).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "doj": str(u.doj)} for u in users]


@router.get("/stalled-approvals")
def stalled_goal_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    cutoff = datetime.utcnow() - timedelta(days=5)
    goals = db.query(Goal).filter(Goal.status == "pending_approval", Goal.created_at < cutoff).all()
    return [{
        "id": g.id, "title": g.title, "owner_id": g.owner_id,
        "pending_since": str(g.created_at), "days_pending": (datetime.utcnow() - g.created_at.replace(tzinfo=None)).days
    } for g in goals]


@router.get("/cycle-compliance")
def cycle_compliance(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    enrollments = db.query(CycleEnrollment).filter(CycleEnrollment.cycle_id == cycle_id).all()
    total = len(enrollments)
    user_ids = [e.user_id for e in enrollments]
    submitted = db.query(FeedbackForm).filter(
        FeedbackForm.cycle_id == cycle_id,
        FeedbackForm.status == "submitted",
        FeedbackForm.employee_id.in_(user_ids)
    ).count()
    return {
        "cycle_id": cycle_id,
        "total_enrolled": total,
        "submitted": submitted,
        "pending": total - submitted,
        "completion_rate": round((submitted / total * 100) if total else 0, 1)
    }


@router.get("/catchup-briefing")
def catchup_briefing(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """First-login catch-up briefing for new admins."""
    open_flags = db.query(Flag).filter(Flag.status.in_(["open", "escalated"])).count()
    stalled = db.query(Goal).filter(
        Goal.status == "pending_approval",
        Goal.created_at < datetime.utcnow() - timedelta(days=5)
    ).count()
    active_cycle = db.query(ReviewCycle).filter(ReviewCycle.status == "active").first()
    no_manager = db.query(User).filter(User.role == "employee", User.manager_id == None).count()
    return {
        "open_flags": open_flags,
        "stalled_approvals": stalled,
        "employees_without_manager": no_manager,
        "active_cycle": active_cycle.name if active_cycle else None,
    }
