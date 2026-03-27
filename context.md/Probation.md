The Probation Service is responsible for everything related to an employee’s probation period — mainly Day 30, Day 60, Day 80 reviews, forms, reminders, escalations, and probation status tracking.

Think of it as a time-based workflow engine for new employees.

1. What Probation Service Does

The Probation Service handles:

Employee DOJ → Calculate working days → Trigger forms →
Send reminders → Escalate → Store feedback → Show status to Admin

So it is mainly:

Time tracking
Form triggering
Reminder & escalation logic
Probation status tracking
Cross-sharing feedback
2. Responsibilities of Probation Service
Core Responsibilities
Track employee Date of Joining (DOJ)
Calculate 30 / 60 / 80 working days
Trigger feedback forms
Send reminders
Escalate to Admin if not submitted
Store probation feedback
Handle probation edge cases
Provide probation status to dashboard
3. Probation Workflow
Employee joins
      ↓
System stores DOJ
      ↓
Scheduler checks working days
      ↓
Day 30 reached
      ↓
Create Employee + Manager forms
      ↓
Send email
      ↓
If not submitted → reminders
      ↓
If still not submitted → escalation
      ↓
Repeat for Day 60
      ↓
Repeat for Day 80
      ↓
Admin review before confirmation
4. Probation Service Architecture
                Scheduler / Cron
                        │
                        ▼
                Probation Service
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   Form Generator   Reminder Engine   Escalation Engine
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                     Database
                        │
                        ▼
                 Notification Service
5. Probation Service Components
Inside Probation Service there should be:
1. Probation Tracker

Tracks:

DOJ
Working days
Leave days
Probation paused/resumed
Expected trigger dates
2. Trigger Engine

Creates forms when:

Day 30
Day 60
Day 80

Creates:

Employee self-feedback form
Manager feedback form
3. Reminder Engine

If forms not submitted:

Reminder after 2 days
Reminder after 4 days
Reminder after 6 days
4. Escalation Engine

If still not submitted after 7 days:

Notify Admin
Add to Admin dashboard
5. Cross Share Engine

Rules:

Employee cannot see manager feedback until both submit
Manager cannot see employee feedback until both submit

Status:

Waiting for Employee
Waiting for Manager
Both Submitted → Cross-share enabled