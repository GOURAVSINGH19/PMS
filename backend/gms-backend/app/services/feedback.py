from sqlalchemy.orm import Session
from app.models.feedback import Feedback
from app.models.goal import Goal
from app.schemas.feedback import MemberFeedbackCreate, EvaluatorFeedbackCreate
from app.enums import FeedbackType, GoalStatus

class FeedbackService:
    def submit_member_feedback(self, db: Session, goal_id: int, user_id: int, feedback_data: MemberFeedbackCreate) -> Feedback:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal or goal.assignee_id != user_id:
            raise ValueError("Goal not found or unauthorized")
        if goal.status != GoalStatus.AWAITING_FEEDBACK:
            raise ValueError("Can only submit feedback for goals awaiting feedback")
        
        existing = db.query(Feedback).filter(
            Feedback.goal_id == goal_id,
            Feedback.feedback_type == FeedbackType.MEMBER
        ).first()
        if existing:
            raise ValueError("Member feedback already submitted")
        
        feedback = Feedback(
            goal_id=goal_id,
            user_id=user_id,
            feedback_type=FeedbackType.MEMBER,
            deliverables=feedback_data.deliverables,
            improvements=feedback_data.improvements
        )
        db.add(feedback)
        
        self._check_and_update_status(db, goal)
        
        db.commit()
        db.refresh(feedback)
        return feedback
    
    def submit_evaluator_feedback(self, db: Session, goal_id: int, evaluator_id: int, feedback_data: EvaluatorFeedbackCreate) -> Feedback:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise ValueError("Goal not found")
        if goal.status != GoalStatus.AWAITING_FEEDBACK:
            raise ValueError("Can only submit feedback for goals awaiting feedback")
        
        existing = db.query(Feedback).filter(
            Feedback.goal_id == goal_id,
            Feedback.feedback_type == FeedbackType.EVALUATOR
        ).first()
        if existing:
            raise ValueError("Evaluator feedback already submitted")
        
        feedback = Feedback(
            goal_id=goal_id,
            user_id=evaluator_id,
            feedback_type=FeedbackType.EVALUATOR,
            quality_rating=feedback_data.quality_rating,
            timeliness_rating=feedback_data.timeliness_rating,
            innovation_rating=feedback_data.innovation_rating,
            collaboration_rating=feedback_data.collaboration_rating,
            impact_rating=feedback_data.impact_rating,
            evaluator_comment=feedback_data.evaluator_comment
        )
        db.add(feedback)
        
        self._check_and_update_status(db, goal)
        
        db.commit()
        db.refresh(feedback)
        return feedback
    
    def _check_and_update_status(self, db: Session, goal: Goal):
        member_feedback = db.query(Feedback).filter(
            Feedback.goal_id == goal.id,
            Feedback.feedback_type == FeedbackType.MEMBER
        ).first()
        
        evaluator_feedback = db.query(Feedback).filter(
            Feedback.goal_id == goal.id,
            Feedback.feedback_type == FeedbackType.EVALUATOR
        ).first()
        
        if member_feedback and evaluator_feedback:
            goal.status = GoalStatus.SCORABLE
            db.commit()

feedback_service = FeedbackService()
