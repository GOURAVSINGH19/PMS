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
