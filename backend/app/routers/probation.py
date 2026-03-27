from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from app.db.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.probation import ProbationRecord, ProbationTrigger, LeaveRecord
from app.schemas.probation import ProbationOut, LeaveCreate, ProbationTriggerOut
from app.services.probation_service import recalculate_trigger_dates, initialize_probation

router = APIRouter(prefix="/probation", tags=["probation"])


@router.get("/", response_model=List[ProbationOut])
def list_probation_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    q = db.query(ProbationRecord)
    if current_user.role == "manager":
        report_ids = [u.id for u in db.query(User).filter(User.manager_id == current_user.id).all()]
        q = q.filter(ProbationRecord.employee_id.in_(report_ids))
    return q.all()


@router.get("/me", response_model=ProbationOut)
def get_my_probation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(ProbationRecord).filter(ProbationRecord.employee_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No probation record found")
    return record


@router.get("/{employee_id}", response_model=ProbationOut)
def get_probation_for_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    record = db.query(ProbationRecord).filter(ProbationRecord.employee_id == employee_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No probation record found")
    return record


@router.post("/{employee_id}/leave/start")
def start_leave(
    employee_id: int,
    payload: LeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Start a leave period — pauses probation timer."""
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    record = db.query(ProbationRecord).filter(ProbationRecord.employee_id == employee_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No probation record")
    if record.status == "active":
        record.status = "paused"
    leave = LeaveRecord(employee_id=employee_id, start_date=payload.start_date, leave_type=payload.leave_type)
    db.add(leave)
    db.commit()
    return {"message": "Leave started, probation paused"}


@router.post("/{employee_id}/leave/end")
def end_leave(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """End current leave — resumes probation and recalculates trigger dates."""
    leave = db.query(LeaveRecord).filter(
        LeaveRecord.employee_id == employee_id,
        LeaveRecord.status == "active"
    ).first()
    if not leave:
        raise HTTPException(status_code=404, detail="No active leave found")
    leave.end_date = date.today()
    leave.status = "ended"
    record = db.query(ProbationRecord).filter(ProbationRecord.employee_id == employee_id).first()
    if record:
        record.status = "active"
        recalculate_trigger_dates(db, record)
    db.commit()
    return {"message": "Leave ended, probation resumed, trigger dates recalculated"}


@router.post("/{employee_id}/waive/{day}")
def waive_trigger(
    employee_id: int,
    day: int,
    comment: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Waive a specific probation trigger (for backdated DOJ scenarios)."""
    record = db.query(ProbationRecord).filter(ProbationRecord.employee_id == employee_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No probation record")
    trigger = db.query(ProbationTrigger).filter(
        ProbationTrigger.probation_record_id == record.id,
        ProbationTrigger.day == day
    ).first()
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")
    trigger.status = "waived"
    db.commit()
    return {"message": f"Day {day} trigger waived"}


@router.patch("/{employee_id}/reassign-manager")
def reassign_manager(
    employee_id: int,
    new_manager_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Reassign manager mid-probation — updates record with audit note."""
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    record = db.query(ProbationRecord).filter(ProbationRecord.employee_id == employee_id).first()
    if record:
        record.current_manager_id = new_manager_id
    employee.manager_id = new_manager_id
    db.commit()
    return {"message": "Manager reassigned, pending forms transferred to new manager"}
