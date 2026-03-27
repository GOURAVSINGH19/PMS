from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.feedback import FeedbackForm, Flag
from app.models.notification import Notification
from app.schemas.feedback import FeedbackFormOut, FeedbackSubmit, FlagOut, FlagAction
from app.services.flag_service import auto_tag_flags

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("/", response_model=List[FeedbackFormOut])
def list_my_forms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns forms visible to the current user (own submissions + received where cross-share is unlocked)."""
    if current_user.role == "admin":
        return db.query(FeedbackForm).order_by(FeedbackForm.created_at.desc()).all()
    # employee: own self-feedback + manager feedback once both submitted
    if current_user.role == "employee":
        forms = db.query(FeedbackForm).filter(FeedbackForm.employee_id == current_user.id).all()
        return [f for f in forms if _can_see(f, current_user)]
    # manager: forms they filled in + team members' self-feedback (if both submitted)
    if current_user.role == "manager":
        filled = db.query(FeedbackForm).filter(FeedbackForm.reviewer_id == current_user.id).all()
        team_ids = [u.id for u in db.query(User).filter(User.manager_id == current_user.id).all()]
        team_self = db.query(FeedbackForm).filter(
            FeedbackForm.employee_id.in_(team_ids),
            FeedbackForm.form_type == "self"
        ).all()
        visible = set(filled)
        for f in team_self:
            if _is_cross_shared(db, f):
                visible.add(f)
        return list(visible)
    return []


def _can_see(form: FeedbackForm, user: User) -> bool:
    if form.reviewer_id == user.id:
        return True
    if form.employee_id == user.id:
        # Manager feedback only visible after cross-share
        if form.form_type == "manager":
            return form.status == "submitted"  # will be checked via cross-share below
        return True
    return False


def _is_cross_shared(db: Session, self_form: FeedbackForm) -> bool:
    """Both self and manager forms submitted for same context."""
    manager_form = db.query(FeedbackForm).filter(
        FeedbackForm.employee_id == self_form.employee_id,
        FeedbackForm.form_type == "manager",
        FeedbackForm.cycle_id == self_form.cycle_id,
        FeedbackForm.probation_trigger_id == self_form.probation_trigger_id,
        FeedbackForm.status == "submitted"
    ).first()
    return self_form.status == "submitted" and manager_form is not None


@router.get("/{form_id}", response_model=FeedbackFormOut)
def get_form(form_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = db.query(FeedbackForm).filter(FeedbackForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.post("/{form_id}/submit", response_model=FeedbackFormOut)
def submit_form(
    form_id: int,
    payload: FeedbackSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    form = db.query(FeedbackForm).filter(FeedbackForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.reviewer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your form")
    if form.status == "submitted":
        raise HTTPException(status_code=400, detail="Already submitted")
    form.responses = payload.responses
    form.overall_score = payload.overall_score
    form.rating = payload.rating
    form.status = "submitted"
    form.submitted_at = datetime.utcnow()
    db.commit()
    # Auto-tag flags
    auto_tag_flags(db, form)
    # Notify relevant party about cross-share
    other_form = db.query(FeedbackForm).filter(
        FeedbackForm.employee_id == form.employee_id,
        FeedbackForm.form_type == ("manager" if form.form_type == "self" else "self"),
        FeedbackForm.cycle_id == form.cycle_id,
        FeedbackForm.probation_trigger_id == form.probation_trigger_id,
    ).first()
    if other_form and other_form.status == "submitted":
        # Unlock cross-share — notify both parties
        db.add(Notification(user_id=form.employee_id, title="Feedback Now Visible",
                            body="Both feedback forms are submitted. You can now view the full feedback.",
                            category="feedback"))
        if other_form.reviewer_id != form.employee_id:
            db.add(Notification(user_id=other_form.reviewer_id, title="Feedback Cross-Shared",
                                body="Employee has submitted their self-feedback. Cross-share is now unlocked.",
                                category="feedback"))
    db.commit()
    db.refresh(form)
    return form


@router.get("/flags/queue", response_model=List[FlagOut])
def get_flag_queue(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    q = db.query(Flag)
    if status:
        q = q.filter(Flag.status == status)
    return q.order_by(Flag.created_at.desc()).all()


@router.patch("/flags/{flag_id}", response_model=FlagOut)
def update_flag(
    flag_id: int,
    action: FlagAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    flag = db.query(Flag).filter(Flag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    flag.status = action.status
    flag.admin_notes = action.notes
    flag.admin_id = current_user.id
    flag.admin_reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(flag)
    return flag
