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
    
    def resolve_flag(self, db: Session, form_id: int, admin_id: int) -> ReviewForm:
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


red_flag_engine = RedFlagEngine()
