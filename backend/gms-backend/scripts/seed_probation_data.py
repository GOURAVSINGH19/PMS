import sys
import os
from datetime import date, timedelta, datetime

# Add the parent directory to sys.path to import app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal, engine
from app.models.user import User
from app.models.probation import ProbationRecord, ProbationTrigger, ProbationFeedback
from app.enums import ProbationStatus, ProbationTriggerStatus, ProbationFeedbackType, UserRole

def seed_probation():
    db = SessionLocal()
    try:
        print("--- Seeding Probation Data ---")
        
        # 1. Find some members to put on probation
        members = db.query(User).filter(User.role == UserRole.MEMBER).limit(3).all()
        if not members:
            print("No members found. Please seed users first.")
            return

        # 2. Find a manager to submit feedback
        manager = db.query(User).filter(User.role == UserRole.MANAGER).first()
        if not manager:
            manager = db.query(User).filter(User.role == UserRole.ADMIN).first()

        for idx, member in enumerate(members):
            # Check if record already exists
            existing = db.query(ProbationRecord).filter(ProbationRecord.employee_id == member.id).first()
            if existing:
                print(f"Record for {member.name} already exists. Skipping.")
                continue

            # Create Record
            # Variety: Some joined recently, some longer ago
            doj = date.today() - timedelta(days=(30 + idx * 25))
            record = ProbationRecord(
                employee_id=member.id,
                date_of_joining=doj,
                probation_status=ProbationStatus.IN_PROBATION,
                recommendation=None
            )
            db.add(record)
            db.flush() # Get record ID

            print(f"Created Probation Record for {member.name} (DOJ: {doj})")

            # 3. Create Triggers (30, 60, 80)
            days = [30, 60, 80]
            for day in days:
                trigger_date = doj + timedelta(days=day)
                
                # Logic: If trigger_date <= today, it might be submitted or triggered
                status = ProbationTriggerStatus.TRIGGERED
                if trigger_date < date.today():
                    if day == 30 or (day == 60 and idx == 0): # Make some "Submitted"
                        status = ProbationTriggerStatus.SUBMITTED
                
                trigger = ProbationTrigger(
                    probation_record_id=record.id,
                    trigger_day=day,
                    trigger_date=trigger_date,
                    status=status
                )
                db.add(trigger)
                db.flush()

                # 4. Add Feedback if Submitted
                if status == ProbationTriggerStatus.SUBMITTED:
                    # Self Feedback
                    db.add(ProbationFeedback(
                        probation_trigger_id=trigger.id,
                        submitted_by_id=member.id,
                        feedback_type=ProbationFeedbackType.SELF,
                        form_data={"q1": "I am learning fast", "q2": "Working on technical skills"},
                        is_flagged=False
                    ))
                    
                    # Manager Feedback (only for some)
                    if manager and idx % 2 == 0:
                        db.add(ProbationFeedback(
                            probation_trigger_id=trigger.id,
                            submitted_by_id=manager.id,
                            feedback_type=ProbationFeedbackType.MANAGER,
                            form_data={"performance": "Excellent", "areas_of_improvement": "Communication"},
                            is_flagged=False
                        ))
            
        db.commit()
        print("--- Seeding Complete ---")
        
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_probation()
