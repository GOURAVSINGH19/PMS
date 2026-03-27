1. What Employee Can Do in PMS

Employee features only:

View dashboard
Create goals
Submit goals for approval
Update goal progress
Submit self-feedback (probation / review cycles)
View manager feedback (after cross-share)
Receive notifications
View performance history

So Employee module mainly interacts with:

Goal Service
Feedback Service
Review Service
Probation Service
Notification Service
2. Employee High Level Architecture
                Employee (Browser)
                        │
                        ▼
                 Frontend (React)
                        │
                        ▼
                   API Gateway
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   Goal Service    Review Service   Probation Service
        │               │               │
        └──────┬────────┴───────┬───────┘
               ▼                ▼
         Feedback Service   Notification Service
                        │
                        ▼
                      Database
3. Employee Dashboard (Main Screen)

Employee dashboard should show:

- My Goals
- Goal Completion %
- Pending Goal Approvals
- Pending Feedback Forms
- Upcoming Reviews
- Probation Status
- Notifications
- Performance History

So dashboard pulls data from multiple services.

4. Employee Main Workflows
4.1 Goal Workflow (Employee)
Create Goal
    ↓
Save Draft
    ↓
Submit for Approval
    ↓
Manager Approves
    ↓
Goal becomes Active
    ↓
Employee Updates Progress %
    ↓
Goal Completed
Goal States
Draft → Pending Approval → Active → Completed → Archived
4.2 Self Feedback Workflow
Trigger (Probation or Review Cycle)
        ↓
Employee receives email/notification
        ↓
Employee fills self feedback form
        ↓
Submit
        ↓
Waiting for Manager Feedback
        ↓
Cross-share after both submit
4.3 Probation Workflow (Employee View)
Day 30 form
Day 60 form
Day 80 form
Employee fills forms
Employee can see:
    - Submitted
    - Pending
    - Waiting for Manager
5. Employee Module Services
Services Used by Employee Module
Service	Purpose
Auth Service	Login
User Service	Employee profile
Goal Service	Goals
Review Service	Review cycles
Probation Service	Probation forms
Feedback Service	Feedback forms
Notification Service	Emails & alerts

Employee module does not need Admin service.


. Employee Dashboard Data Aggregation Flow
Employee opens dashboard
        ↓
Dashboard API
        ↓
Fetch Goals
Fetch Pending Feedback
Fetch Review Cycles
Fetch Probation Status
Fetch Notifications
        ↓
Combine response
        ↓
Send to frontend

So dashboard service is basically aggregation layer.



10. If You Are Designing Only Employee Module, Focus On These 5 Things

Very important:

1. Employee Dashboard
2. Goal Creation & Tracking
3. Self Feedback Forms
4. Review Cycle Self Reviews
5. Notifications

If these are built, Employee module is complete.