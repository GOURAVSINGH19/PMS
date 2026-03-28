#!/usr/bin/env python3
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models import user, team, goal, subtask, progress, feedback, score
from app.auth import hash_password
from app.enums import UserRole

db = SessionLocal()

# Check if admin exists
admin = db.query(user.User).filter(user.User.email == 'prashant.sharma@opstree.com').first()
if not admin:
    admin = user.User(
        email='prashant.sharma@opstree.com',
        name='Prashant Sharma',
        password_hash=hash_password('password123'),
        role=UserRole.ADMIN,
        department='IT',
        is_active=True
    )
    db.add(admin)
    db.commit()
    print('Created admin')
else:
    print('Admin exists')

# Check if manager exists
manager = db.query(user.User).filter(user.User.email == 'gourav.singh@opstree.com').first()
if not manager:
    manager = user.User(
        email='gourav.singh@opstree.com',
        name='Gourav Singh',
        password_hash=hash_password('password123'),
        role=UserRole.MANAGER,
        department='Engineering',
        is_active=True
    )
    db.add(manager)
    db.commit()
    print('Created manager')
else:
    print('Manager exists')

# Check if employee exists
employee = db.query(user.User).filter(user.User.email == 'harshit.verma@opstree.com').first()
if not employee:
    employee = user.User(
        email='harshit.verma@opstree.com',
        name='Harshit Verma',
        password_hash=hash_password('password123'),
        role=UserRole.MEMBER,
        department='Engineering',
        manager_id=manager.id,
        is_active=True
    )
    db.add(employee)
    db.commit()
    print('Created employee')
else:
    print('Employee exists')

db.close()
print('Done!')
