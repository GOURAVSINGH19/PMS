from sqlalchemy.orm import Session
from datetime import datetime
from app.models.notification import Notification
from app.models.user import User
from app.enums import UserRole


def _send_email_stub(to_email: str, subject: str, body: str):
    print(f"[EMAIL] To: {to_email} | Subject: {subject}")
    print(f"        {body[:120]}")


class NotificationService:

    def create(self, db: Session, recipient_id: int, notification_type: str,
               title: str, message: str, entity_type: str = None, entity_id: int = None) -> Notification:
        n = Notification(
            recipient_id=recipient_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_entity_type=entity_type,
            related_entity_id=entity_id,
        )
        db.add(n)
        db.commit()
        db.refresh(n)
        return n

    # ── Goal notifications ────────────────────────────────────────────────

    def notify_goal_submitted(self, db: Session, goal) -> None:
        assignee = db.query(User).filter(User.id == goal.assignee_id).first()
        if not assignee or not assignee.manager_id:
            return
        manager = db.query(User).filter(User.id == assignee.manager_id).first()
        if not manager:
            return
        title = f"Goal pending approval: {goal.title}"
        msg = f"{assignee.name} submitted a goal for your approval."
        self.create(db, manager.id, "goal_submitted", title, msg, "goal", goal.id)
        _send_email_stub(manager.email, title, msg)

    def notify_goal_approved(self, db: Session, goal) -> None:
        title = f"Goal approved: {goal.title}"
        msg = "Your goal has been approved and is now active."
        self.create(db, goal.assignee_id, "goal_approved", title, msg, "goal", goal.id)
        assignee = db.query(User).filter(User.id == goal.assignee_id).first()
        if assignee:
            _send_email_stub(assignee.email, title, msg)

    def notify_goal_rejected(self, db: Session, goal, comment: str = "") -> None:
        title = f"Goal rejected: {goal.title}"
        msg = f"Your goal was rejected. Reason: {comment}"
        self.create(db, goal.assignee_id, "goal_rejected", title, msg, "goal", goal.id)
        assignee = db.query(User).filter(User.id == goal.assignee_id).first()
        if assignee:
            _send_email_stub(assignee.email, title, msg)

    # ── Probation notifications ───────────────────────────────────────────

    def notify_probation_trigger(self, db: Session, trigger, employee: User) -> None:
        title = f"Probation Day {trigger.trigger_day} form ready"
        msg = f"Please complete your Day {trigger.trigger_day} probation self-feedback form."
        self.create(db, employee.id, "probation_trigger", title, msg, "probation_trigger", trigger.id)
        _send_email_stub(employee.email, title, msg)

        if employee.manager_id:
            manager = db.query(User).filter(User.id == employee.manager_id).first()
            if manager:
                mgr_msg = f"Please complete the Day {trigger.trigger_day} probation feedback for {employee.name}."
                self.create(db, manager.id, "probation_trigger", title, mgr_msg, "probation_trigger", trigger.id)
                _send_email_stub(manager.email, title, mgr_msg)

    def notify_probation_reminder(self, db: Session, trigger, employee: User) -> None:
        title = f"Reminder: Probation Day {trigger.trigger_day} form pending"
        msg = "Your probation feedback form is still pending. Please submit it."
        self.create(db, employee.id, "probation_reminder", title, msg, "probation_trigger", trigger.id)
        _send_email_stub(employee.email, title, msg)

    def notify_probation_escalation(self, db: Session, trigger, employee: User) -> None:
        title = f"ESCALATION: Probation Day {trigger.trigger_day} overdue for {employee.name}"
        msg = f"Probation feedback for {employee.name} has not been submitted after 7 days."
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            self.create(db, admin.id, "probation_escalation", title, msg, "probation_trigger", trigger.id)
            _send_email_stub(admin.email, title, msg)

    # ── Review notifications ──────────────────────────────────────────────

    def notify_review_cycle_started(self, db: Session, cycle, employees: list) -> None:
        title = f"Review cycle started: {cycle.cycle_name}"
        for employee in employees:
            msg = f"The {cycle.cycle_name} review cycle has started. Please complete your self-assessment by {cycle.self_review_deadline}."
            self.create(db, employee.id, "review_cycle_started", title, msg, "review_cycle", cycle.id)
            _send_email_stub(employee.email, title, msg)

    def notify_review_reminder(self, db: Session, form, user: User, urgent: bool = False) -> None:
        prefix = "URGENT: " if urgent else ""
        title = f"{prefix}Review form pending"
        msg = "Your review form is still pending. Please submit it before the deadline."
        self.create(db, user.id, "review_reminder", title, msg, "review_form", form.id)
        _send_email_stub(user.email, title, msg)

    def notify_review_escalation(self, db: Session, form, user: User) -> None:
        title = "ESCALATION: Review form overdue"
        msg = f"Review form for employee {form.employee_id} is overdue."
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            self.create(db, admin.id, "review_escalation", title, msg, "review_form", form.id)
            _send_email_stub(admin.email, title, msg)

    def notify_flag(self, db: Session, feedback_id: int, entity_type: str) -> None:
        title = "Red flag detected in feedback"
        msg = f"A feedback submission has been auto-flagged for review. Entity: {entity_type} #{feedback_id}"
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            self.create(db, admin.id, "red_flag", title, msg, entity_type, feedback_id)
            _send_email_stub(admin.email, title, msg)


notification_service = NotificationService()
