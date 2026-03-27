1. Goal Management Service (GMS)

This is the system where goals are created, approved, weighted, and tracked.

What Goal Service Does

Responsible for:

Create goals
Goal hierarchy (Company → Team → Individual)
Goal approval workflow
Weightage (must total 100%)
Track completion %
Archive goals
Goal history
Aggregate team/company progress
Goal Workflow
Employee creates goal
      ↓
Save as Draft
      ↓
Submit for approval
      ↓
Manager/Admin approves
      ↓
Weightage assigned
      ↓
Goal becomes Active
      ↓
Employee updates completion %
      ↓
Goal Completed
      ↓
Archived after cycle
Goal States
Draft → Pending Approval → Active → Completed → Archived
Goal Service Architecture
            Frontend
               │
               ▼
          API Gateway
               │
               ▼
           Goal Service
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
 Goal CRUD  Approval   Aggregation
                         Engine
               │
               ▼
             Database
               │
               ▼
       Notification Service
Goal Service Components

Inside Goal Service:

Component	Purpose
Goal CRUD	Create/update/delete goals
Approval Engine	Manager/Admin approves
Weightage Validator	Total must = 100%
Progress Tracker	Completion %
Aggregation Engine	Team/company progress
Goal History	Archive
Notification Trigger	Notify approvals
Goal Tables
goals
goal_approvals
goal_progress
goal_hierarchy
goal_history
Goal APIs
POST   /goals
GET    /goals
PUT    /goals/:id
POST   /goals/:id/submit
POST   /goals/:id/approve
POST   /goals/:id/reject
PUT    /goals/:id/progress
POST   /goals/:id/archive


2. Review Service (Performance Review Cycles)

This handles Quarterly and Bi-Annual reviews.
This is different from probation.
What Review Service Does

Responsible for:

Create review cycles
Trigger cycle start
Create self review forms
Create manager review forms
Track submissions
Final ratings
Close cycles
Store performance history
Review Workflow
Cycle starts
     ↓
Employee self review
     ↓
Manager review
     ↓
Manager final rating
     ↓
Cycle closed
     ↓
Performance history stored
Review Cycle Timeline Example

Bi-Annual:

Aug 1 → Cycle starts
Aug 5 → Reminder
Aug 15 → Urgent reminder
Aug 22 → Escalation to Admin
Aug 25 → Close cycle
Aug 26 → Finalize ratings
Review Service Architecture
             Scheduler
                │
                ▼
           Review Service
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
 Cycle Engine  Form Engine  Rating Engine
                │
                ▼
              Database
                │
                ▼
         Notification Service
Review Service Components
Component	Purpose
Cycle Engine	Manage quarterly/biannual cycles
Form Engine	Create feedback forms
Submission Tracker	Track pending forms
Reminder Engine	Send reminders
Rating Engine	Final ratings
Cycle Close Engine	Close cycle
Performance History	Store ratings
Escalation Engine	Notify Admin