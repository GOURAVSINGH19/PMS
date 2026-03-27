"""
Cycle service: auto-enrolls eligible employees into a new review cycle.
Eligibility: joined > 60 days before cycle close date.
Deduplication: if quarterly and bi-annual overlap, run quarterly only.
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.cycle import ReviewCycle, CycleEnrollment
from app.models.feedback import FeedbackForm
from app.models.notification import Notification


def auto_enroll_cycle(db: Session, cycle: ReviewCycle) -> None:
    """Enroll all eligible employees and create their feedback form placeholders."""
    eligibility_cutoff = cycle.close_date - timedelta(days=60)
    employees = db.query(User).filter(
        User.role == "employee",
        User.is_active == True,
        User.doj <= eligibility_cutoff,
    ).all()

    for emp in employees:
        # Deduplication: skip bi-annual if already enrolled in overlapping quarterly
        if cycle.track == "bi_annual":
            quarterly_overlap = db.query(CycleEnrollment).join(ReviewCycle).filter(
                CycleEnrollment.user_id == emp.id,
                ReviewCycle.track == "quarterly",
                ReviewCycle.period_start <= cycle.period_end,
                ReviewCycle.period_end >= cycle.period_start,
            ).first()
            if quarterly_overlap:
                db.add(CycleEnrollment(cycle_id=cycle.id, user_id=emp.id, status="skipped"))
                continue

        # Only include employees whose review track matches or is "both"
        if emp.review_track not in (cycle.track, "both"):
            continue

        db.add(CycleEnrollment(cycle_id=cycle.id, user_id=emp.id, status="enrolled"))

        # Create feedback form stubs
        db.add(FeedbackForm(
            employee_id=emp.id,
            reviewer_id=emp.id,
            form_type="self",
            context=cycle.track,
            cycle_id=cycle.id,
            status="pending",
        ))
        if emp.manager_id:
            db.add(FeedbackForm(
                employee_id=emp.id,
                reviewer_id=emp.manager_id,
                form_type="manager",
                context=cycle.track,
                cycle_id=cycle.id,
                status="pending",
            ))

        # Notify employee
        db.add(Notification(
            user_id=emp.id,
            title=f"📋 Review Cycle Started: {cycle.name}",
            body=f"You are enrolled in {cycle.name}. Please complete your self-review by {cycle.close_date}.",
            category="cycle",
            action_url="/feedback",
        ))

    db.commit()
