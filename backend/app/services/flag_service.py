"""
Flag service: auto-tags feedback forms for red flags based on score threshold
and detects repeat flags across consecutive cycles.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.feedback import FeedbackForm, Flag
from app.models.notification import Notification
from app.models.user import User
from app.core.config import settings


def auto_tag_flags(db: Session, form: FeedbackForm) -> None:
    """Run after a form is submitted. Adds flag rows if criteria met."""
    flags_to_create = []

    # 1. Low score threshold
    if form.overall_score is not None and form.overall_score <= settings.RED_FLAG_SCORE_THRESHOLD:
        flags_to_create.append("low_score")

    # 2. Blank open-ended (soft flag)
    if form.responses:
        comments = form.responses.get("comments", "")
        if not comments or len(str(comments).strip()) < 5:
            flags_to_create.append("incomplete")

    # 3. Repeat flag detection — flagged in any previous cycle for same employee
    if flags_to_create:
        prev_flags = db.query(Flag).join(FeedbackForm, Flag.form_id == FeedbackForm.id).filter(
            FeedbackForm.employee_id == form.employee_id,
            FeedbackForm.id != form.id,
            Flag.status != "resolved",
        ).count()
        is_repeat = prev_flags >= 1

        for reason in flags_to_create:
            flag = Flag(
                form_id=form.id,
                reason=reason,
                status="open",
                is_repeat=is_repeat,
            )
            db.add(flag)

        # Notify admins
        admins = db.query(User).filter(User.role == "admin").all()
        repeat_prefix = "🔁 Repeat " if is_repeat else ""
        for admin in admins:
            db.add(Notification(
                user_id=admin.id,
                title=f"{repeat_prefix}Red Flag Detected",
                body=f"A feedback form (ID {form.id}) has been flagged: {', '.join(flags_to_create)}",
                category="escalation",
                action_url=f"/admin/flags",
            ))

    db.commit()
