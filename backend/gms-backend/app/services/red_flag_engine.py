from sqlalchemy.orm import Session
from typing import Dict
from app.models.review import ReviewForm
from app.enums import ReviewFormType

class RedFlagEngine:
    """
    Automated red flag detection for review forms.
    Scans for low ratings, blank responses, and patterns.
    """
    
    def __init__(self):
        self.threshold = 2  # Configurable: ratings <= 2 trigger flags
        self.negative_keywords = [
            "poor", "bad", "terrible", "awful", "unacceptable",
            "disappointing", "inadequate", "unsatisfactory"
        ]
    
    def scan_feedback(self, db: Session, form: ReviewForm) -> Dict:
        """
        Scan a review form for red flags.
        Returns: {"is_flagged": int (0-3), "flag_reason": str}
        """
        flags = []
        severity = 0  # 0=none, 1=soft, 2=medium, 3=critical
        
        # Check 1: Low rating (manager feedback only)
        if form.form_type == ReviewFormType.MANAGER_FEEDBACK and form.final_rating:
            if form.final_rating <= self.threshold:
                flags.append(f"Low rating: {form.final_rating}/5")
                severity = max(severity, 2)
        
        # Check 2: Blank or minimal responses
        if form.form_data:
            text_fields = [v for v in form.form_data.values() if isinstance(v, str)]
            if not text_fields or all(len(t.strip()) < 10 for t in text_fields):
                flags.append("Incomplete responses")
                severity = max(severity, 1)
        
        # Check 3: Negative sentiment in text
        if form.form_data:
            text = " ".join(str(v).lower() for v in form.form_data.values() if isinstance(v, str))
            if any(keyword in text for keyword in self.negative_keywords):
                flags.append("Negative sentiment detected")
                severity = max(severity, 2)
        
        # Check 4: Pattern detection (repeat flags)
        if severity >= 2:
            pattern_count = self._check_pattern(db, form.employee_id)
            if pattern_count >= 2:
                flags.append(f"REPEAT FLAG: {pattern_count} consecutive cycles")
                severity = 3
        
        return {
            "is_flagged": severity,
            "flag_reason": "; ".join(flags) if flags else None
        }
    
    def _check_pattern(self, db: Session, employee_id: int) -> int:
        """
        Check how many consecutive cycles this employee has been flagged.
        Returns count of consecutive flags.
        """
        from app.models.review import ReviewPerformanceHistory
        
        # Get last 3 review cycles for this employee
        history = db.query(ReviewPerformanceHistory).filter(
            ReviewPerformanceHistory.employee_id == employee_id
        ).order_by(ReviewPerformanceHistory.created_at.desc()).limit(3).all()
        
        # Count consecutive flags (assuming rating <= 2 means flagged)
        consecutive = 0
        for record in history:
            if record.rating and int(record.rating) <= self.threshold:
                consecutive += 1
            else:
                break
        
        return consecutive
    
    def get_flagged_forms(self, db: Session, skip: int = 0, limit: int = 100):
        """Get all flagged forms for admin review"""
        return db.query(ReviewForm).filter(
            ReviewForm.is_flagged >= 2
        ).order_by(ReviewForm.submitted_at.desc()).offset(skip).limit(limit).all()

    def get_admin_triage_queue(self, db: Session, include_soft_flags: bool = False):
        """Get enriched flagged forms for admin triage queue"""
        from datetime import datetime
        from app.models.user import User
        min_severity = 1 if include_soft_flags else 2
        forms = db.query(ReviewForm).filter(
            ReviewForm.is_flagged >= min_severity,
            ReviewForm.flag_reviewed_at == None
        ).order_by(ReviewForm.submitted_at.desc()).all()
        result = []
        for form in forms:
            employee = db.query(User).filter(User.id == form.employee_id).first()
            age_days = (datetime.utcnow() - form.created_at).days if form.created_at else 0
            result.append({
                "form_id": form.id,
                "employee_id": form.employee_id,
                "employee_name": employee.name if employee else "Unknown",
                "form_type": form.form_type.value if form.form_type else None,
                "severity": form.is_flagged,
                "flag_reason": form.flag_reason,
                "rating": form.final_rating,
                "submitted_at": form.submitted_at.isoformat() if form.submitted_at else None,
                "age_days": age_days,
                "cycle_id": form.review_cycle_id,
            })
        return result

    def mark_flag_reviewed(self, db: Session, form_id: int, admin_id: int, notes: str = None) -> ReviewForm:
        """Mark a flag as reviewed by admin"""
        from datetime import datetime
        form = db.query(ReviewForm).filter(ReviewForm.id == form_id).first()
        if not form:
            raise ValueError("Form not found")
        form.flag_reviewed_at = datetime.utcnow()
        form.flag_reviewed_by = admin_id
        db.commit()
        db.refresh(form)
        return form

    def get_flag_statistics(self, db: Session):
        """Get overall flag statistics"""
        total = db.query(ReviewForm).filter(ReviewForm.is_flagged >= 1).count()
        open_flags = db.query(ReviewForm).filter(ReviewForm.is_flagged >= 2, ReviewForm.flag_reviewed_at == None).count()
        resolved = db.query(ReviewForm).filter(ReviewForm.is_flagged >= 1, ReviewForm.flag_reviewed_at != None).count()
        critical = db.query(ReviewForm).filter(ReviewForm.is_flagged == 3).count()
        return {"total": total, "open": open_flags, "resolved": resolved, "critical": critical}

    def resolve_flag(self, db: Session, form_id: int, admin_id: int) -> ReviewForm:
        """Mark a flag as reviewed by admin"""
        return self.mark_flag_reviewed(db, form_id, admin_id)


red_flag_engine = RedFlagEngine()
