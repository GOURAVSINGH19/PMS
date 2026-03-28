from enum import Enum

class GoalStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    COMPLETED = "completed"
    AWAITING_FEEDBACK = "awaiting_feedback"
    SCORABLE = "scorable"
    SCORED = "scored"
    REJECTED = "rejected"

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    MEMBER = "member"

class GoalLevel(str, Enum):
    COMPANY = "company"
    TEAM = "team"
    INDIVIDUAL = "individual"

class GoalTag(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class GoalPriority(str, Enum):
    CRITICAL = "critical"    # 40% weightage
    HIGH = "high"            # 30% weightage
    MEDIUM = "medium"        # 20% weightage
    LOW = "low"              # 10% weightage

class FeedbackType(str, Enum):
    MEMBER = "member"
    EVALUATOR = "evaluator"

class PerformanceRating(str, Enum):
    BELOW_EXPECTATIONS = "below_expectations"
    MEETS_EXPECTATIONS = "meets_expectations"
    ABOVE_EXPECTATIONS = "above_expectations"

class ProbationStatus(str, Enum):
    IN_PROBATION = "in_probation"
    COMPLETED = "completed"
    REJECTED = "rejected"
    PAUSED = "paused"

class ProbationTriggerStatus(str, Enum):
    TRIGGERED = "triggered"
    SUBMITTED = "submitted"
    ESCALATED = "escalated"
    BLOCKED = "blocked"  # No manager assigned

class ProbationFeedbackType(str, Enum):
    SELF = "self"
    MANAGER = "manager"

class ReviewCycleType(str, Enum):
    QUARTERLY = "quarterly"
    BI_ANNUAL = "bi_annual"

class ReviewCycleStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    CLOSED = "closed"

class ReviewFormType(str, Enum):
    SELF_ASSESSMENT = "self_assessment"
    MANAGER_FEEDBACK = "manager_feedback"

class ReviewFormStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    WAIVED = "waived"
