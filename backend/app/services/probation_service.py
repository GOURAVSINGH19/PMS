"""
Probation service: handles working-day calculation, trigger initialization,
leave-pause logic, and trigger-date recalculation.
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.probation import ProbationRecord, ProbationTrigger, LeaveRecord
from app.models.user import User
from app.models.notification import Notification


def _count_working_days_between(start: date, end: date) -> int:
    """Count Mon–Fri days between two dates (inclusive)."""
    count = 0
    current = start
    while current <= end:
        if current.weekday() < 5:  # Mon=0 … Fri=4
            count += 1
        current += timedelta(days=1)
    return count


def _count_leave_working_days(db: Session, employee_id: int, from_date: date, to_date: date) -> int:
    """Count working days spent on leave between two dates."""
    leaves = db.query(LeaveRecord).filter(
        LeaveRecord.employee_id == employee_id,
        LeaveRecord.status == "ended",
        LeaveRecord.start_date <= to_date,
    ).all()
    leave_days = 0
    for leave in leaves:
        start = max(leave.start_date, from_date)
        end = min(leave.end_date or to_date, to_date)
        if start <= end:
            leave_days += _count_working_days_between(start, end)
    return leave_days


def _add_working_days(start: date, working_days: int) -> date:
    """Return the date after `working_days` working days from start."""
    count = 0
    current = start
    while count < working_days:
        current += timedelta(days=1)
        if current.weekday() < 5:
            count += 1
    return current


def initialize_probation(db: Session, user: User) -> ProbationRecord:
    """Create a ProbationRecord + 3 ProbationTriggers for a new employee."""
    if not user.doj:
        return None
    record = ProbationRecord(
        employee_id=user.id,
        status="active",
        effective_doj=user.doj,
        leave_days_accumulated=0,
        current_manager_id=user.manager_id,
    )
    db.add(record)
    db.flush()  # Get record.id

    for day in (30, 60, 80):
        sched = _add_working_days(user.doj, day)
        trigger = ProbationTrigger(
            probation_record_id=record.id,
            day=day,
            scheduled_date=sched,
            status="pending",
        )
        db.add(trigger)

    # Alert admin if no manager assigned
    if not user.manager_id:
        admins = db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            db.add(Notification(
                user_id=admin.id,
                title="⚠️ New Employee Without Manager",
                body=f"{user.name} joined on {user.doj} but has no manager assigned. Probation triggers are blocked.",
                category="probation",
                action_url=f"/admin/no-manager",
            ))

    db.commit()
    return record


def recalculate_trigger_dates(db: Session, record: ProbationRecord) -> None:
    """Recalculate future trigger scheduled_dates after leave ends."""
    employee = db.query(User).filter(User.id == record.employee_id).first()
    if not employee or not employee.doj:
        return
    for trigger in record.triggers:
        if trigger.status == "pending":
            leave_days = _count_leave_working_days(db, record.employee_id, employee.doj, date.today())
            new_date = _add_working_days(employee.doj, trigger.day + leave_days)
            trigger.scheduled_date = new_date
    db.commit()
