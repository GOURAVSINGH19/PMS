from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.schemas.auth import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if department:
        q = q.filter(User.department == department)
    # Managers only see their direct reports
    if current_user.role == "manager":
        q = q.filter(User.manager_id == current_user.id)
    return q.all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Employees can only see themselves
    if current_user.role == "employee" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/team/my", response_model=List[UserOut])
def get_my_team(db: Session = Depends(get_db), current_user: User = Depends(require_role("manager", "admin"))):
    return db.query(User).filter(User.manager_id == current_user.id).all()
