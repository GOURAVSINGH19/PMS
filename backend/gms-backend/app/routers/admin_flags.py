from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.permissions import require_admin
from app.models.user import User
from app.services.red_flag_engine import red_flag_engine
from pydantic import BaseModel

router = APIRouter()


class FlagReviewRequest(BaseModel):
    notes: str | None = None


@router.get("/flags/triage")
def get_triage_queue(
    include_soft_flags: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all flagged forms for admin review.
    Returns enriched data with employee info, flag details, and aging.
    """
    require_admin(current_user)
    return red_flag_engine.get_admin_triage_queue(db, include_soft_flags)


@router.post("/flags/{form_id}/review")
def mark_flag_reviewed(
    form_id: int,
    request: FlagReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a flagged form as reviewed by admin"""
    require_admin(current_user)
    try:
        form = red_flag_engine.mark_flag_reviewed(db, form_id, current_user.id, request.notes)
        return {"message": "Flag marked as reviewed", "form_id": form.id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/flags/statistics")
def get_flag_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overall flag statistics for dashboard"""
    require_admin(current_user)
    return red_flag_engine.get_flag_statistics(db)


@router.get("/flags/employee/{employee_id}/history")
def get_employee_flag_history(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get flag history for a specific employee"""
    require_admin(current_user)
    
    from app.models.review import ReviewForm
    from datetime import datetime, timedelta
    
    one_year_ago = datetime.utcnow() - timedelta(days=365)
    
    flagged_forms = db.query(ReviewForm).filter(
        ReviewForm.employee_id == employee_id,
        ReviewForm.is_flagged >= 1,
        ReviewForm.created_at >= one_year_ago
    ).order_by(ReviewForm.created_at.desc()).all()
    
    return [{
        "form_id": form.id,
        "cycle_id": form.review_cycle_id,
        "flag_level": "RED FLAG" if form.is_flagged == 2 else "Soft Flag",
        "flag_reason": form.flag_reason,
        "rating": form.final_rating,
        "submitted_at": form.submitted_at.isoformat() if form.submitted_at else None,
        "reviewed": form.flag_reviewed_at is not None,
        "reviewed_at": form.flag_reviewed_at.isoformat() if form.flag_reviewed_at else None
    } for form in flagged_forms]
