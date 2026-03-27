from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.db.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.cycle import ReviewCycle, CycleEnrollment
from app.schemas.cycle import CycleOut, CycleCreate, EnrollmentOut
from app.services.cycle_service import auto_enroll_cycle

router = APIRouter(prefix="/cycles", tags=["cycles"])


@router.post("/", response_model=CycleOut, status_code=201)
def create_cycle(
    payload: CycleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    cycle = ReviewCycle(**payload.model_dump())
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    auto_enroll_cycle(db, cycle)
    return cycle


@router.get("/", response_model=List[CycleOut])
def list_cycles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ReviewCycle).order_by(ReviewCycle.trigger_date.desc()).all()


@router.get("/{cycle_id}", response_model=CycleOut)
def get_cycle(cycle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cycle = db.query(ReviewCycle).filter(ReviewCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle


@router.get("/{cycle_id}/enrollments", response_model=List[EnrollmentOut])
def get_enrollments(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    return db.query(CycleEnrollment).filter(CycleEnrollment.cycle_id == cycle_id).all()


@router.patch("/{cycle_id}/status")
def update_cycle_status(
    cycle_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    cycle = db.query(ReviewCycle).filter(ReviewCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    if status not in ("upcoming", "active", "closed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    cycle.status = status
    db.commit()
    return {"message": f"Cycle status updated to {status}"}
