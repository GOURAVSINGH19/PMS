import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.permissions import require_admin
from app.models.user import User
from app.models.feedback import Feedback
from app.models.probation import ProbationFeedback, ProbationRecord
from app.models.goal import Goal
from app.models.review import ReviewCycle, ReviewForm

router = APIRouter()


# ── Flag management ───────────────────────────────────────────────────────

@router.get("/flags")
def get_all_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    goal_flags = db.query(Feedback).filter(Feedback.is_flagged == True).all()
    probation_flags = db.query(ProbationFeedback).filter(ProbationFeedback.is_flagged == True).all()
    return {
        "goal_feedback_flags": [
            {"id": f.id, "goal_id": f.goal_id, "user_id": f.user_id,
             "flag_reason": f.flag_reason, "created_at": f.created_at}
            for f in goal_flags
        ],
        "probation_feedback_flags": [
            {"id": f.id, "trigger_id": f.probation_trigger_id, "submitted_by": f.submitted_by_id,
             "flag_reason": f.flag_reason, "submitted_at": f.submitted_at}
            for f in probation_flags
        ],
    }


@router.post("/flags/goal/{feedback_id}/resolve")
def resolve_goal_flag(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    f = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not f:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Feedback not found")
    f.is_flagged = False
    f.flag_reason = None
    db.commit()
    return {"message": "Flag resolved"}


@router.post("/flags/probation/{feedback_id}/resolve")
def resolve_probation_flag(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    f = db.query(ProbationFeedback).filter(ProbationFeedback.id == feedback_id).first()
    if not f:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Feedback not found")
    f.is_flagged = False
    f.flag_reason = None
    db.commit()
    return {"message": "Flag resolved"}


# ── Reports ───────────────────────────────────────────────────────────────

@router.get("/reports/goals")
def report_goals(
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    goals = db.query(Goal).all()
    rows = [
        {
            "id": g.id, "title": g.title, "level": g.level.value,
            "status": g.status.value, "priority": g.priority.value,
            "weightage": g.weightage, "completion_pct": g.completion_percentage,
            "assignee_id": g.assignee_id, "team_id": g.team_id,
            "start_date": str(g.start_date), "due_date": str(g.due_date),
            "is_at_risk": g.is_at_risk,
        }
        for g in goals
    ]
    if format == "csv":
        return _to_csv(rows, "goals_report.csv")
    return {"data": rows, "total": len(rows)}


@router.get("/reports/probation")
def report_probation(
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    records = db.query(ProbationRecord).all()
    rows = [
        {
            "id": r.id, "employee_id": r.employee_id,
            "date_of_joining": str(r.date_of_joining),
            "status": r.probation_status.value,
            "is_paused": r.is_paused,
            "triggers_count": len(r.triggers),
            "submitted_triggers": sum(1 for t in r.triggers if t.status.value == "submitted"),
        }
        for r in records
    ]
    if format == "csv":
        return _to_csv(rows, "probation_report.csv")
    return {"data": rows, "total": len(rows)}


@router.get("/reports/reviews")
def report_reviews(
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    cycles = db.query(ReviewCycle).all()
    rows = []
    for c in cycles:
        total = len(c.forms)
        from app.enums import ReviewFormStatus
        submitted = sum(1 for f in c.forms if f.status == ReviewFormStatus.SUBMITTED)
        rows.append({
            "cycle_id": c.id, "cycle_name": c.cycle_name,
            "cycle_type": c.cycle_type.value, "status": c.status.value,
            "start_date": str(c.start_date), "end_date": str(c.end_date),
            "total_forms": total, "submitted_forms": submitted,
            "completion_rate": round(submitted / total * 100, 1) if total else 0,
        })
    if format == "csv":
        return _to_csv(rows, "reviews_report.csv")
    return {"data": rows, "total": len(rows)}


def _to_csv(rows: list, filename: str) -> StreamingResponse:
    if not rows:
        return StreamingResponse(io.StringIO(""), media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename={filename}"})
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
