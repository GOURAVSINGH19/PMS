export const GoalStatus = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  AWAITING_FEEDBACK: 'awaiting_feedback',
  SCORABLE: 'scorable',
  SCORED: 'scored',
  REJECTED: 'rejected'
};

export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

export const GoalLevel = {
  COMPANY: 'company',
  TEAM: 'team',
  INDIVIDUAL: 'individual'
};

export const GoalTag = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

export const GoalPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const FeedbackType = {
  EMPLOYEE: 'employee',
  EVALUATOR: 'evaluator'
};

export const PerformanceRating = {
  BELOW_EXPECTATIONS: 'below_expectations',
  MEETS_EXPECTATIONS: 'meets_expectations',
  ABOVE_EXPECTATIONS: 'above_expectations'
};

export const PRIORITY_WEIGHTAGE = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10
};

export const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  awaiting_feedback: 'bg-purple-100 text-purple-800',
  scorable: 'bg-indigo-100 text-indigo-800',
  scored: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800'
};

export const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};
