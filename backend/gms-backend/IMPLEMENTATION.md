# PMS Backend — Implementation Plan
**Scope: Backend only. Do NOT touch frontend.**
**Base: `backend/gms-backend/` (FastAPI + PostgreSQL + SQLAlchemy + Alembic)**

---

## Current State (What Already Exists)

### ✅ Done
- `User` model — id, email, name, password_hash, role (admin/manager/member), manager_id, team_id
- `Team` model — id, name, manager_id
- `Goal` model — full lifecycle (DRAFT→PENDING_APPROVAL→ACTIVE→AWAITING_FEEDBACK→SCORABLE→SCORED→REJECTED)
- `Subtask` model — goal subtasks with completion tracking
- `Progress` model — completion % updates with notes
- `Feedback` model — member + evaluator feedback with ratings
- `Score` model — final performance rating (below/meets/above expectations)
- Auth — JWT login, bcrypt passwords, HTTPBearer
- RBAC — require_admin, require_manager_or_admin
- Weightage validation — per user per tag period, max 100%
- At-risk detection — >70% time elapsed AND <50% completion
- Repositories — BaseRepository + GoalRepository + UserRepository + TeamRepository
- Services — GoalService, UserService, TeamService, FeedbackService, ScoreService
- Alembic — migration setup with env.py

### ❌ Missing (PRD Requirements)
- `date_of_joining` on User model
- `is_active` on User model
- Probation module (records, triggers, feedback, reminders)
- Review Cycles module (bi-annual + quarterly)
- Review Forms module (self-assessment + manager feedback)
- Notification model + email sending
- Scheduler (APScheduler) for automated triggers
- Red-flag auto-tagging on feedback
- Dashboard aggregation endpoints (team/company stats)
- Reporting endpoints (CSV/PDF export)
- Pagination on list endpoints
- Standardized API response envelope `{status, data, message, timestamp}`
- `parent_id` on Goal for Company→Team→Individual hierarchy
- Goal history/audit log

---

## PRD → Existing Code Mapping

| PRD Concept | Existing Code | Gap |
|---|---|---|
| Employee role | `UserRole.MEMBER` | rename or alias needed |
| Manager role | `UserRole.MANAGER` | ✅ matches |
| Admin role | `UserRole.ADMIN` | ✅ matches |
| Goal CRUD | `routers/goals.py` + `services/goal.py` | ✅ exists |
| Goal approval workflow | `goal_service.approve_goal()` | ✅ exists |
| Weightage validation | `goal_service.create_goal()` | ✅ exists |
| Goal hierarchy (Company→Team→Individual) | `GoalLevel` enum | `parent_id` FK missing |
| Feedback (self + manager) | `models/feedback.py` | ✅ exists, maps to PRD |
| Performance rating | `models/score.py` | ✅ exists |
| Probation Day 30/60/80 | ❌ nothing | full build needed |
| Review cycles | ❌ nothing | full build needed |
| Notifications/email | ❌ nothing | full build needed |
| Scheduler | ❌ nothing | APScheduler needed |
| DOJ on user | ❌ missing column | migration needed |
| Dashboard stats | partial (weightage endpoint only) | aggregation endpoints needed |

---

## Implementation Phases

---

## Phase 1 — User Model Extension + Alembic Migration
**Files to change:** `app/models/user.py`, new Alembic migration

### 1.1 Add fields to `User` model
```
date_of_joining: Date (nullable)
is_active: Boolean (default True)
department: String (nullable)
```

### 1.2 Generate and run Alembic migration
```bash
alembic revision --autogenerate -m "add_doj_isactive_department_to_users"
alembic upgrade head
```

### 1.3 Update `UserCreate` / `UserUpdate` schemas
- Add `date_of_joining`, `is_active`, `department` fields
- Update `UserService.create_user()` to accept these

### 1.4 Update seed.py
- Add `date_of_joining` to seeded users for probation testing

---

## Phase 2 — Goal Hierarchy (parent_id)
**Files to change:** `app/models/goal.py`, `app/schemas/goal.py`, `app/services/goal.py`, new migration

### 2.1 Add `parent_id` to `Goal` model
```python
parent_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
parent = relationship("Goal", remote_side=[id], backref="child_goals")
```

### 2.2 Update `GoalCreate` schema
- Add optional `parent_id` field

### 2.3 Update `GoalService.create_goal()`
- Validate parent goal exists and is at a higher hierarchy level
  - COMPANY goal cannot have a parent
  - TEAM goal parent must be COMPANY
  - INDIVIDUAL goal parent must be TEAM or COMPANY

### 2.4 Add aggregation endpoint
```
GET /api/v1/goals/stats/team    → team completion %, at-risk count, by-status breakdown
GET /api/v1/goals/stats/company → org-wide stats, team comparison
```

### 2.5 Alembic migration
```bash
alembic revision --autogenerate -m "add_parent_id_to_goals"
alembic upgrade head
```

---

## Phase 3 — Probation Module
**New files:**
- `app/models/probation.py`
- `app/schemas/probation.py`
- `app/services/probation_service.py`
- `app/routers/probation.py`
- New Alembic migration

### 3.1 Models

#### `ProbationRecord`
```
id, employee_id (FK users), date_of_joining (Date),
probation_status (Enum: IN_PROBATION, COMPLETED, REJECTED, PAUSED),
is_paused (Boolean, default False),
pause_start_date (Date, nullable),
pause_resume_date (Date, nullable),
created_at (DateTime)
```

#### `ProbationTrigger`
```
id, probation_record_id (FK), trigger_day (Integer: 30|60|80),
trigger_date (Date), status (Enum: PENDING, TRIGGERED, SUBMITTED, ESCALATED),
created_at (DateTime)
```

#### `ProbationFeedback`
```
id, probation_trigger_id (FK), submitted_by_id (FK users),
feedback_type (Enum: SELF, MANAGER),
form_data (JSON), submitted_at (DateTime)
```

#### `ProbationReminder`
```
id, probation_trigger_id (FK), reminder_sent_at (DateTime),
reminder_count (Integer, default 0), next_reminder_at (DateTime)
```

### 3.2 Schemas (`app/schemas/probation.py`)
- `ProbationRecordCreate` — employee_id
- `ProbationRecord` — full response with triggers
- `ProbationFeedbackCreate` — form_data (dict), feedback_type
- `ProbationFeedback` — full response
- `ProbationTriggerResponse` — trigger with feedback status

### 3.3 Service (`app/services/probation_service.py`)

#### `calculate_working_days(start_date, end_date) -> int`
- Count Mon–Fri days between dates
- Subtract paused periods

#### `get_or_create_probation_record(db, employee_id) -> ProbationRecord`
- Called when user is created with a DOJ

#### `check_and_fire_triggers(db) -> None`  ← called by scheduler
- For each IN_PROBATION record:
  - Calculate working days since DOJ (minus paused days)
  - For trigger_day in [30, 60, 80]:
    - If working_days >= trigger_day AND no trigger exists → create ProbationTrigger (status=TRIGGERED)
    - If trigger exists with status=TRIGGERED:
      - days since trigger_date >= 2 → send reminder 1
      - days since trigger_date >= 4 → send reminder 2
      - days since trigger_date >= 6 → send reminder 3
      - days since trigger_date >= 7 → escalate (status=ESCALATED), notify admin

#### `submit_probation_feedback(db, trigger_id, user_id, feedback_data) -> ProbationFeedback`
- Validate user is employee (SELF) or manager (MANAGER) of that employee
- Save ProbationFeedback
- If both SELF + MANAGER submitted → update trigger status=SUBMITTED
- Cross-share: both feedbacks become readable to both parties

#### `pause_probation(db, record_id, pause_date) -> ProbationRecord`
#### `resume_probation(db, record_id, resume_date) -> ProbationRecord`
#### `complete_probation(db, record_id) -> ProbationRecord`
#### `reject_probation(db, record_id) -> ProbationRecord`

### 3.4 Router (`app/routers/probation.py`)
```
POST   /api/v1/probation/                          # Create record (admin)
GET    /api/v1/probation/                          # List all (admin/manager)
GET    /api/v1/probation/{record_id}               # Get record detail
GET    /api/v1/probation/employee/{employee_id}    # Get by employee
POST   /api/v1/probation/{record_id}/pause         # Pause (admin)
POST   /api/v1/probation/{record_id}/resume        # Resume (admin)
POST   /api/v1/probation/{record_id}/complete      # Complete (admin)
POST   /api/v1/probation/{record_id}/reject        # Reject (admin)
GET    /api/v1/probation/triggers/{trigger_id}     # Get trigger detail
POST   /api/v1/probation/triggers/{trigger_id}/feedback  # Submit feedback
GET    /api/v1/probation/triggers/{trigger_id}/feedback  # Get feedbacks (cross-share)
```

### 3.5 Alembic migration
```bash
alembic revision --autogenerate -m "add_probation_tables"
alembic upgrade head
```

---

## Phase 4 — Review Cycles Module
**New files:**
- `app/models/review.py`
- `app/schemas/review.py`
- `app/services/review_service.py`
- `app/routers/reviews.py`
- New Alembic migration

### 4.1 Models

#### `ReviewCycle`
```
id, cycle_name (String), cycle_type (Enum: QUARTERLY, BI_ANNUAL),
start_date (Date), end_date (Date),
self_review_deadline (Date), manager_review_deadline (Date),
status (Enum: PENDING, ACTIVE, CLOSED),
created_by_id (FK users), created_at (DateTime)
```

#### `ReviewForm`
```
id, review_cycle_id (FK), employee_id (FK users), manager_id (FK users),
form_type (Enum: SELF_ASSESSMENT, MANAGER_FEEDBACK),
status (Enum: PENDING, IN_PROGRESS, SUBMITTED),
form_data (JSON, nullable), final_rating (Integer 1-5, nullable),
submitted_at (DateTime, nullable), created_at (DateTime)
```

#### `ReviewPerformanceHistory`
```
id, employee_id (FK users), review_cycle_id (FK),
performance_score (Float), rating (String),
feedback_summary (Text), created_at (DateTime)
```

### 4.2 Schemas (`app/schemas/review.py`)
- `ReviewCycleCreate` — cycle_name, cycle_type, start_date, end_date, deadlines
- `ReviewCycle` — full response with form counts
- `ReviewFormSubmit` — form_data (dict), final_rating (optional)
- `ReviewForm` — full response
- `ReviewHistoryResponse` — employee history

### 4.3 Service (`app/services/review_service.py`)

#### `create_cycle(db, cycle_data, created_by_id) -> ReviewCycle`
- Validate dates (end > start, deadlines within range)
- Create ReviewCycle with status=PENDING

#### `trigger_cycle(db, cycle_id, admin_id) -> ReviewCycle`
- Set status=ACTIVE
- For each eligible employee (joined > 60 days before cycle end_date):
  - Create ReviewForm (SELF_ASSESSMENT) for employee
  - Create ReviewForm (MANAGER_FEEDBACK) for their manager
- Send notifications (stub for now, real email in Phase 6)

#### `submit_form(db, form_id, user_id, form_data, final_rating) -> ReviewForm`
- Validate user owns this form
- Set status=SUBMITTED, submitted_at=now
- If both SELF + MANAGER forms submitted → cross-share + create ReviewPerformanceHistory

#### `close_cycle(db, cycle_id, admin_id) -> ReviewCycle`
- Set status=CLOSED
- Mark all unsubmitted forms as waived (log it)

#### `get_my_forms(db, user_id) -> List[ReviewForm]`
#### `get_cycle_compliance(db, cycle_id) -> dict`
- Returns submitted/total counts per employee

### 4.4 Router (`app/routers/reviews.py`)
```
POST   /api/v1/review-cycles/                          # Create cycle (admin)
GET    /api/v1/review-cycles/                          # List cycles
GET    /api/v1/review-cycles/{cycle_id}                # Get cycle detail
POST   /api/v1/review-cycles/{cycle_id}/trigger        # Trigger cycle (admin)
POST   /api/v1/review-cycles/{cycle_id}/close          # Close cycle (admin)
GET    /api/v1/review-cycles/{cycle_id}/compliance     # Compliance report (admin/manager)
GET    /api/v1/review-forms/                           # Get my forms
GET    /api/v1/review-forms/{form_id}                  # Get form detail
POST   /api/v1/review-forms/{form_id}/submit           # Submit form
GET    /api/v1/review-history/                         # My performance history
GET    /api/v1/review-history/{employee_id}            # Employee history (manager/admin)
```

### 4.5 Alembic migration
```bash
alembic revision --autogenerate -m "add_review_tables"
alembic upgrade head
```

---

## Phase 5 — Notification Model + Email Stub
**New files:**
- `app/models/notification.py`
- `app/schemas/notification.py`
- `app/services/notification_service.py`
- `app/routers/notifications.py`
- New Alembic migration

### 5.1 Model

#### `Notification`
```
id, recipient_id (FK users), notification_type (String),
title (String), message (Text),
is_read (Boolean, default False),
related_entity_type (String, nullable)  # "goal", "probation_trigger", "review_form"
related_entity_id (Integer, nullable),
created_at (DateTime)
```

### 5.2 Service (`app/services/notification_service.py`)

#### `create_notification(db, recipient_id, type, title, message, entity_type, entity_id)`
- Insert Notification record

#### `send_email_stub(to_email, subject, body)`
- Log to console for now: `print(f"[EMAIL] To: {to_email} | Subject: {subject}")`
- Later replaced with SMTP/SendGrid in Phase 6

#### Notification helper functions (called by other services):
- `notify_goal_submitted(db, goal)` → notify manager
- `notify_goal_approved(db, goal)` → notify employee
- `notify_goal_rejected(db, goal, comment)` → notify employee
- `notify_probation_trigger(db, trigger, employee, manager)` → notify both
- `notify_probation_reminder(db, trigger, user)` → nudge
- `notify_probation_escalation(db, trigger, admin)` → escalate
- `notify_review_cycle_started(db, cycle, employees)` → bulk notify
- `notify_review_reminder(db, form, user)` → nudge

### 5.3 Router (`app/routers/notifications.py`)
```
GET    /api/v1/notifications/           # Get my notifications (paginated)
PATCH  /api/v1/notifications/{id}/read  # Mark as read
PATCH  /api/v1/notifications/read-all  # Mark all as read
GET    /api/v1/notifications/unread-count  # Unread count
```

### 5.4 Wire notifications into existing services
- `GoalService.submit_for_approval()` → call `notify_goal_submitted()`
- `GoalService.approve_goal()` → call `notify_goal_approved()` or `notify_goal_rejected()`

### 5.5 Alembic migration
```bash
alembic revision --autogenerate -m "add_notifications_table"
alembic upgrade head
```

---

## Phase 6 — Scheduler (APScheduler)
**New files:**
- `app/scheduler.py`
- Update `app/main.py`

### 6.1 Install APScheduler
Add to `requirements.txt`:
```
apscheduler==3.10.4
```

### 6.2 `app/scheduler.py`
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

scheduler = AsyncIOScheduler()

def start_scheduler(app):
    scheduler.add_job(
        run_probation_checks,
        IntervalTrigger(hours=6),
        id="probation_check",
        replace_existing=True
    )
    scheduler.add_job(
        run_review_reminders,
        IntervalTrigger(hours=24),
        id="review_reminders",
        replace_existing=True
    )
    scheduler.start()
```

#### `run_probation_checks()`
- Get DB session
- Call `probation_service.check_and_fire_triggers(db)`
- For each TRIGGERED trigger past reminder thresholds → send reminders/escalations

#### `run_review_reminders()`
- Get DB session
- For each ACTIVE cycle:
  - Find unsubmitted forms
  - Check days since cycle triggered
  - Day 5 → gentle nudge
  - Day 15 → urgent nudge
  - Day 22 → escalate to admin

### 6.3 Wire into `app/main.py`
```python
@app.on_event("startup")
async def startup():
    start_scheduler(app)

@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown()
```

---

## Phase 7 — Dashboard Aggregation Endpoints
**Files to change:** `app/routers/goals.py`, new `app/routers/dashboard.py`

### 7.1 New router `app/routers/dashboard.py`

#### `GET /api/v1/dashboard/me`
Returns for current user:
```json
{
  "total_goals": 5,
  "active_goals": 2,
  "completed_goals": 1,
  "at_risk_goals": 1,
  "avg_completion_pct": 45.0,
  "pending_review_forms": 1,
  "probation_status": null | "IN_PROBATION",
  "unread_notifications": 3
}
```

#### `GET /api/v1/dashboard/team` (manager/admin)
Returns for manager's team:
```json
{
  "team_id": 1,
  "team_name": "Engineering",
  "members": [
    {
      "user_id": 2,
      "name": "Alice",
      "total_goals": 4,
      "active": 2,
      "completed": 1,
      "at_risk": 1,
      "avg_completion_pct": 55.0
    }
  ],
  "team_completion_pct": 48.0,
  "pending_approvals": 2,
  "at_risk_count": 1
}
```

#### `GET /api/v1/dashboard/company` (admin only)
Returns org-wide:
```json
{
  "total_employees": 20,
  "total_goals": 80,
  "active_goals": 40,
  "completed_goals": 15,
  "at_risk_goals": 5,
  "teams": [
    { "team_id": 1, "team_name": "Engineering", "completion_pct": 55.0 }
  ],
  "probation_in_progress": 3,
  "open_review_cycles": 1,
  "pending_escalations": 2
}
```

### 7.2 Existing goal stats endpoints
Add to `app/routers/goals.py`:
```
GET /api/v1/goals/stats/team     → team goal breakdown
GET /api/v1/goals/stats/company  → company goal breakdown
```

---

## Phase 8 — Red-Flag Auto-Tagging
**Files to change:** `app/models/feedback.py`, `app/services/feedback.py`, migration

### 8.1 Add `is_flagged` + `flag_reason` to `Feedback` model
```python
is_flagged = Column(Boolean, default=False)
flag_reason = Column(String, nullable=True)
```

### 8.2 Add `is_flagged` + `flag_reason` to `ProbationFeedback` model

### 8.3 Auto-tag logic in `FeedbackService`
After saving any feedback:
- If any rating field <= 2 → `is_flagged=True`, `flag_reason="Low rating"`
- If evaluator_comment is blank → `is_flagged=True`, `flag_reason="Incomplete"`
- Notify admin via `notification_service.notify_flag()`

### 8.4 Admin flag endpoints
```
GET  /api/v1/admin/flags          # All flagged feedback (admin only)
POST /api/v1/admin/flags/{id}/resolve  # Mark flag reviewed
```

---

## Phase 9 — Reporting Endpoints
**New file:** `app/routers/reports.py`

### 9.1 Endpoints
```
GET /api/v1/reports/goals?format=json|csv     # Goal summary report
GET /api/v1/reports/probation?format=json|csv # Probation report
GET /api/v1/reports/reviews?format=json|csv   # Review cycle report
```

### 9.2 CSV export
- Use Python `csv` module + `io.StringIO`
- Return `StreamingResponse` with `text/csv` content-type

---

## Phase 10 — Standardized Response Envelope + Pagination
**New file:** `app/response.py`
**Files to change:** all routers (gradual)

### 10.1 `app/response.py`
```python
from datetime import datetime

def success(data, message="OK"):
    return {
        "status": "success",
        "data": data,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }

def error(message, errors=None):
    return {
        "status": "error",
        "data": None,
        "message": message,
        "errors": errors or [],
        "timestamp": datetime.utcnow().isoformat()
    }
```

### 10.2 Pagination helper
```python
def paginate(query, page: int, limit: int):
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": items,
        "pagination": {
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit,
            "limit": limit
        }
    }
```

### 10.3 Add `?page=1&limit=20` to list endpoints
- `GET /api/v1/goals/`
- `GET /api/v1/users/`
- `GET /api/v1/probation/`
- `GET /api/v1/notifications/`

---

## File Change Summary

### New Files to Create
```
app/models/probation.py
app/models/review.py
app/models/notification.py
app/schemas/probation.py
app/schemas/review.py
app/schemas/notification.py
app/services/probation_service.py
app/services/review_service.py
app/services/notification_service.py
app/services/dashboard_service.py
app/routers/probation.py
app/routers/reviews.py
app/routers/notifications.py
app/routers/dashboard.py
app/routers/reports.py
app/routers/admin.py
app/scheduler.py
app/response.py
alembic/versions/001_add_doj_isactive_to_users.py
alembic/versions/002_add_parent_id_to_goals.py
alembic/versions/003_add_probation_tables.py
alembic/versions/004_add_review_tables.py
alembic/versions/005_add_notifications_table.py
alembic/versions/006_add_flags_to_feedback.py
```

### Existing Files to Modify
```
app/models/user.py          → add date_of_joining, is_active, department
app/models/goal.py          → add parent_id
app/models/feedback.py      → add is_flagged, flag_reason
app/schemas/user.py         → add new fields
app/schemas/goal.py         → add parent_id
app/services/goal.py        → wire notifications, add hierarchy validation
app/services/user.py        → auto-create probation record on user creation
app/services/feedback.py    → add red-flag auto-tagging
app/routers/goals.py        → add stats endpoints
app/main.py                 → register new routers, wire scheduler
requirements.txt            → add apscheduler
seed.py                     → add date_of_joining to users
```

---

## Execution Order

```
Phase 1  → User model extension + migration
Phase 2  → Goal parent_id + hierarchy validation + stats endpoints
Phase 3  → Probation module (models + service + router + migration)
Phase 4  → Review cycles module (models + service + router + migration)
Phase 5  → Notification model + service + router + wire into existing services
Phase 6  → APScheduler (probation checks + review reminders)
Phase 7  → Dashboard aggregation endpoints
Phase 8  → Red-flag auto-tagging + admin flag endpoints
Phase 9  → Reporting endpoints (JSON + CSV)
Phase 10 → Response envelope + pagination (cleanup pass)
```

Each phase ends with:
1. Alembic migration (if schema changed)
2. Docker rebuild: `docker compose build gms-backend && docker compose up -d gms-backend`
3. Smoke test via `curl` or `/docs`

---

## Key Constraints
- **Do NOT touch anything in `frontend/`**
- All new endpoints must be authenticated (use `Depends(get_current_user)`)
- All admin-only endpoints must call `require_admin(current_user)`
- All manager+ endpoints must call `require_manager_or_admin(current_user)`
- Probation working-day calculation excludes weekends (Mon–Fri only)
- Weightage validation already exists — do not break it
- Existing goal lifecycle (DRAFT→SCORED) must remain intact
- Alembic autogenerate — always import new models in `alembic/env.py` before generating
