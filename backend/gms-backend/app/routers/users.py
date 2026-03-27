from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated
from app.database import get_db
from app.services.user import user_service
from app.dependencies import get_current_user
from app.permissions import require_admin, require_manager_or_admin
from app.models.user import User as UserModel
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    require_admin(current_user)
    return user_service.create_user(db, user_in)

@router.get("/{user_id}", response_model=UserSchema)
def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserSchema])
def list_users(
    skip: int = 0, 
    limit: int = 100,
    team_id: int = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    from app.permissions import require_manager_or_admin
    require_manager_or_admin(current_user)
    return user_service.get_users(db, skip, limit, team_id=team_id)

@router.patch("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int, 
    user_in: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    require_admin(current_user)
    user = user_service.update_user(db, user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    require_admin(current_user)
    if not user_service.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
