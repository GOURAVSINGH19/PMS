from fastapi import HTTPException, status
from app.enums import UserRole

def require_admin(current_user):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

def require_manager_or_admin(current_user):
    # Robust role retrieval: Handle Enum, string, or Enum-as-string cases
    role_raw = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role)
    # Handle potential "UserRole.manager" from str(Enum)
    role = role_raw.split('.')[-1].lower()
    
    # Allowed roles for goal approval/rejection and scoring
    allowed = [UserRole.ADMIN.value, UserRole.MANAGER.value]
    if role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Unauthorized role: '{role}'. Access denied."
        )
