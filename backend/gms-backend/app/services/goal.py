from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional
from app.repositories.goal import goal_repository
from app.repositories.user import user_repository
from app.schemas.goal import GoalCreate, GoalUpdate, ProgressUpdate, SubtaskCreate, SubtaskUpdate, GoalStats
from app.models.goal import Goal
from app.models.subtask import Subtask
from app.models.progress import Progress
from app.enums import GoalStatus, UserRole

class GoalService:
    def create_goal(self, db: Session, goal_data: GoalCreate, creator_id: int) -> Goal:
        creator = user_repository.get_by_id(db, creator_id)
        assignee = user_repository.get_by_id(db, goal_data.assignee_id)
        
        if not creator or not assignee:
            raise ValueError("Creator or assignee not found")
        
        # Validate total weightage doesn't exceed 100% for user's goals in same period
        existing_goals = db.query(Goal).filter(
            Goal.assignee_id == goal_data.assignee_id,
            Goal.tag == goal_data.tag,
            Goal.status.in_([GoalStatus.DRAFT, GoalStatus.PENDING_APPROVAL, GoalStatus.ACTIVE])
        ).all()
        
        total_weightage = sum(g.weightage for g in existing_goals) + goal_data.weightage
        if total_weightage > 100:
            raise ValueError(
                f"Total weightage ({total_weightage}%) exceeds 100%. "
                f"Current: {sum(g.weightage for g in existing_goals)}%, "
                f"Trying to add: {goal_data.weightage}% ({goal_data.priority})"
            )
        
        if creator_id != goal_data.assignee_id and creator.role in [UserRole.ADMIN, UserRole.MANAGER]:
            status = GoalStatus.ACTIVE
        else:
            status = GoalStatus.DRAFT
        
        goal_dict = goal_data.model_dump()
        goal_dict['due_date'] = goal_data.due_date
        goal_dict['weightage'] = goal_data.weightage
        goal_dict['status'] = status
        goal_dict['creator_id'] = creator_id
        goal_dict['team_id'] = assignee.team_id  # Get from assignee's user record
        
        return goal_repository.create(db, **goal_dict)
    
    def get_goal_with_stats(self, db: Session, goal_id: int) -> Optional[Goal]:
        goal = goal_repository.get_by_id(db, goal_id)
        if goal:
            goal.stats = GoalStats(
                days_remaining=goal.days_remaining,
                days_elapsed=goal.days_elapsed,
                total_days=goal.total_days,
                time_elapsed_percentage=goal.time_elapsed_percentage,
                is_overdue=goal.is_overdue,
                is_at_risk=goal.is_at_risk
            )
        return goal
    
    def add_subtask(self, db: Session, goal_id: int, subtask_data: SubtaskCreate, user_id: int) -> Subtask:
        goal = goal_repository.get_by_id(db, goal_id)
        if not goal:
            raise ValueError("Goal not found")
        if goal.assignee_id != user_id and goal.creator_id != user_id:
            raise ValueError("Unauthorized - only assignee or creator can add subtasks")
        
        subtask = Subtask(goal_id=goal_id, **subtask_data.model_dump())
        db.add(subtask)
        db.commit()
        db.refresh(subtask)
        return subtask
    
    def update_subtask(self, db: Session, subtask_id: int, subtask_data: SubtaskUpdate, user_id: int) -> Subtask:
        subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
        if not subtask:
            raise ValueError("Subtask not found")
        
        goal = goal_repository.get_by_id(db, subtask.goal_id)
        if not goal:
            raise ValueError("Goal not found")
        if goal.assignee_id != user_id and goal.creator_id != user_id:
            raise ValueError("Unauthorized - only assignee or creator can update subtasks")
        
        for key, value in subtask_data.model_dump(exclude_unset=True).items():
            setattr(subtask, key, value)
        
        if subtask_data.is_completed and not subtask.completed_at:
            subtask.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(subtask)
        
        self._recalculate_goal_completion(db, goal)
        return subtask
    
    def _recalculate_goal_completion(self, db: Session, goal: Goal):
        subtasks = db.query(Subtask).filter(Subtask.goal_id == goal.id).all()
        if subtasks:
            completed = sum(1 for s in subtasks if s.is_completed)
            goal.completion_percentage = (completed / len(subtasks)) * 100
            db.commit()
    
    def submit_for_approval(self, db: Session, goal_id: int, user_id: int) -> Goal:
        goal = goal_repository.get_by_id(db, goal_id)
        if not goal or goal.creator_id != user_id:
            raise ValueError("Goal not found or unauthorized")
        if goal.status != GoalStatus.DRAFT:
            raise ValueError("Only draft goals can be submitted")
        return goal_repository.update(db, goal, status=GoalStatus.PENDING_APPROVAL)
    
    def approve_goal(self, db: Session, goal_id: int, evaluator_id: int, approved: bool, comment: str = None) -> Goal:
        goal = goal_repository.get_by_id(db, goal_id)
        evaluator = user_repository.get_by_id(db, evaluator_id)
        assignee = user_repository.get_by_id(db, goal.assignee_id)
        
        if not goal or not evaluator or not assignee:
            raise ValueError("Goal, evaluator, or assignee not found")
        
        if goal.status != GoalStatus.PENDING_APPROVAL:
            raise ValueError("Goal is not pending approval")
        
        if evaluator.role != UserRole.ADMIN and assignee.manager_id != evaluator_id:
            raise ValueError("Not authorized to approve this goal")
        
        if approved:
            return goal_repository.update(db, goal, status=GoalStatus.ACTIVE)
        else:
            if not comment:
                raise ValueError("Rejection comment is mandatory")
            return goal_repository.update(db, goal, status=GoalStatus.REJECTED)
    
    def update_progress(self, db: Session, goal_id: int, progress_data: ProgressUpdate, user_id: int) -> Progress:
        goal = goal_repository.get_by_id(db, goal_id)
        if not goal or goal.assignee_id != user_id:
            raise ValueError("Goal not found or unauthorized")
        if goal.status != GoalStatus.ACTIVE:
            raise ValueError("Can only update progress for active goals")
        
        progress = Progress(
            goal_id=goal_id,
            completion_percentage=progress_data.completion_percentage,
            notes=progress_data.notes
        )
        db.add(progress)
        
        goal_repository.update(db, goal, completion_percentage=progress_data.completion_percentage)
        
        if progress_data.completion_percentage >= 100:
            goal_repository.update(db, goal, status=GoalStatus.COMPLETED)
            # Auto-transition to awaiting feedback
            goal_repository.update(db, goal, status=GoalStatus.AWAITING_FEEDBACK)
        
        db.commit()
        db.refresh(progress)
        return progress
    
    def check_at_risk(self, goal: Goal) -> bool:
        if goal.status != GoalStatus.ACTIVE:
            return False
        
        today = date.today()
        total_days = (goal.due_date - goal.created_at.date()).days
        elapsed_days = (today - goal.created_at.date()).days
        
        time_elapsed_pct = (elapsed_days / total_days * 100) if total_days > 0 else 0
        
        return time_elapsed_pct > 70 and goal.completion_percentage < 50

goal_service = GoalService()
