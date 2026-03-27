# PMS - High-Level Design (HLD)
## Performance & Goal Management Platform

**Document Version:** 1.0  
**Date:** March 2026  
**Status:** Architecture Blueprint

---

## 1. Executive Summary

The PMS Platform is a unified, enterprise-grade system designed to centralize:
- **Probation Management** — Automated Day 30/60/80 reviews with reminders & escalations
- **Performance Reviews** — Bi-annual and quarterly review cycles
- **Goal Management** — Structured goal creation, approval, and tracking with hierarchical cascading

**Key Differentiators:**
- Single source of truth for employee performance data
- Role-based access control (Employee, Manager, Admin)
- Automated workflow triggers and notifications
- Real-time dashboards for visibility and compliance

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                             │
│  ┌─────────────────┬──────────────────┬─────────────────┐              │
│  │  Employee UI    │   Manager UI     │    Admin UI     │              │
│  │  (React SPA)    │   (React SPA)    │   (React SPA)   │              │
│  └────────┬────────┴────────┬─────────┴────────┬────────┘              │
└───────────┼──────────────────┼──────────────────┼────────────────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────────┐
│                            API GATEWAY                                    │
│  - Request routing & authentication                                       │
│  - Rate limiting & API versioning                                         │
│  - Request/response transformation                                        │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────────┐ ┌──▼──────────┐ ┌─▼───────────────┐
│  GOAL SERVICE  │ │PROBATION S. │ │ REVIEW SERVICE  │
│                │ │             │ │                 │
│ • CRUD goals   │ │ • DOJ calc  │ │ • Cycles        │
│ • Approval WF  │ │ • Triggers  │ │ • Forms         │
│ • Weightage    │ │ • Reminders │ │ • Ratings       │
│ • Progress     │ │ • Escalate  │ │ • History       │
│ • Aggregation  │ │ • Status    │ │                 │
└────────┬───────┘ └──┬──────────┘ └─┬───────────────┘
         │            │              │
         └────────────┼──────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼──────┐ ┌──▼─────────┐ ┌─▼────────────┐
    │  AUTH SVC │ │ FEEDBACK S │ │NOTIFICATION │
    │           │ │            │ │   SERVICE   │
    │ • Login   │ │ • Store    │ │ • Email     │
    │ • Token   │ │ • Cross    │ │ • Reminders │
    │ • RBAC    │ │   Share    │ │ • Escalate  │
    └───────────┘ └────────────┘ └─────────────┘
                      │
         ┌────────────▼────────────┐
         │     SHARED DATABASE     │
         │  (PostgreSQL/MySQL)     │
         │                         │
         │ Tables:                 │
         │ • users                 │
         │ • goals                 │
         │ • goal_approvals        │
         │ • goal_progress         │
         │ • probation_records     │
         │ • probation_feedback    │
         │ • review_cycles         │
         │ • review_forms          │
         │ • feedback              │
         │ • notifications         │
         └─────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Build Tool | Vite | 8.0.1 |
| Linting | ESLint | 9.39.4 |
| State Management | *(TBD: Redux, Zustand, Jotai)* | - |
| HTTP Client | *(TBD: Axios, TanStack Query)* | - |
| UI Component Library | *(TBD: shadcn/ui, Material-UI)* | - |
| Styling | *(TBD: Tailwind CSS, Styled-components)* | - |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | - |
| Framework | *(TBD: Express, NestJS, Fastify)* | API server |
| Database | PostgreSQL/MySQL | Persistent data |
| ORM | *(TBD: Prisma, TypeORM)* | Data access layer |
| Authentication | *(TBD: JWT, OAuth2)* | Auth & authorization |
| Job Queue | *(TBD: Bull, RabbitMQ)* | Scheduling & workflow |
| Cache | *(TBD: Redis)* | Performance optimization |

### DevOps
| Component | Technology |
|-----------|-----------|
| Containerization | Docker |
| Orchestration | Kubernetes / Docker Compose |
| CI/CD | GitHub Actions / Jenkins |
| Monitoring | *(TBD: Datadog, ELK)* |
| Logging | Centralized logging system |

---

## 4. Core Module Specifications

### 4.1 Goal Management Service (GMS)

**Responsibilities:**
- CRUD operations for goals
- Hierarchical goal structure (Company → Team → Individual)
- Goal approval workflow management
- Weightage validation (total must = 100%)
- Progress tracking and aggregation
- Goal versioning and history

**Key Entities:**
```
Goal
├── id
├── title
├── description
├── hierarchy_level (COMPANY, TEAM, INDIVIDUAL)
├── parent_id (for hierarchy)
├── weightage (0-100)
├── owner_id (Employee or Manager)
├── status (DRAFT, PENDING_APPROVAL, ACTIVE, COMPLETED, ARCHIVED)
├── created_at
├── updated_at
└── created_by

GoalApproval
├── id
├── goal_id
├── approver_id (Manager or Admin)
├── approval_status (PENDING, APPROVED, REJECTED)
├── feedback
├── approved_at

GoalProgress
├── id
├── goal_id
├── completion_percentage (0-100)
├── notes
├── updated_by
├── updated_at

GoalHistory
├── id
├── goal_id
├── change_type (CREATED, UPDATED, APPROVED, COMPLETED)
├── changed_by
├── changed_at
└── previous_values (JSON)
```

**API Endpoints:**
```
POST   /api/v1/goals                 # Create goal
GET    /api/v1/goals                 # List goals (with filters)
GET    /api/v1/goals/:id             # Get goal details
PUT    /api/v1/goals/:id             # Update goal
DELETE /api/v1/goals/:id             # Archive goal (soft delete)
POST   /api/v1/goals/:id/submit      # Submit for approval
POST   /api/v1/goals/:id/approve     # Approve goal
POST   /api/v1/goals/:id/reject      # Reject goal
PUT    /api/v1/goals/:id/progress    # Update progress %
GET    /api/v1/goals/stats/team      # Get team goal stats
GET    /api/v1/goals/stats/company   # Get company goal stats
```

**Workflow State Machine:**
```
DRAFT ──submit──> PENDING_APPROVAL ──approve──> ACTIVE ──complete──> COMPLETED ──archive──> ARCHIVED
                       │ reject                                            │ reopen
                       └──────────────────────────────────────────────────┘
```

---

### 4.2 Probation Service

**Responsibilities:**
- Track employee Date of Joining (DOJ)
- Calculate working days (excluding weekends & holidays)
- Trigger form generation at Day 30, 60, 80
- Manage reminder scheduling
- Handle escalation logic
- Store probation feedback
- Provide probation status tracking

**Key Entities:**
```
ProbationRecord
├── id
├── employee_id
├── date_of_joining
├── working_days_calculated
├── probation_status (IN_PROBATION, COMPLETED, REJECTED, PAUSED)
├── is_paused
├── pause_start_date
├── pause_resume_date
├── created_at

ProbationTrigger
├── id
├── probation_record_id
├── trigger_day (30, 60, 80)
├── trigger_date
├── status (PENDING, TRIGGERED, SUBMITTED, ESCALATED)
├── employee_form_id
├── manager_form_id
├── created_at

ProbationFeedback
├── id
├── probation_trigger_id
├── submitted_by_id (Employee or Manager)
├── feedback_type (SELF, MANAGER)
├── form_data (JSON)
├── submitted_at

ProbationReminder
├── id
├── probation_trigger_id
├── reminder_sent_at
├── reminder_count
├── next_reminder_at
```

**Scheduler Job:**
```
Every 6 hours:
  1. Get all employees in probation
  2. Calculate working days since DOJ
  3. For each trigger point (30, 60, 80):
     - If working days reached: create forms + send email
     - If triggered but not submitted:
       - +2 days: send reminder 1
       - +4 days: send reminder 2
       - +6 days: send reminder 3
       - +7 days: escalate to Admin
```

---

### 4.3 Review Service

**Responsibilities:**
- Create and manage review cycles
- Define cycle periods (Quarterly, Bi-annual)
- Generate review forms (self-assessment, manager feedback)
- Track form submissions
- Calculate final ratings
- Store performance history
- Generate compliance reports

**Key Entities:**
```
ReviewCycle
├── id
├── cycle_name (e.g., "Q1 2026")
├── cycle_type (QUARTERLY, BI_ANNUAL, PROBATION)
├── start_date
├── end_date
├── self_review_deadline
├── manager_review_deadline
├── status (PENDING, ACTIVE, CLOSED)
├── created_by_id
├── created_at

ReviewForm
├── id
├── review_cycle_id
├── employee_id
├── manager_id
├── form_type (SELF_ASSESSMENT, MANAGER_FEEDBACK)
├── status (PENDING, IN_PROGRESS, SUBMITTED)
├── form_data (JSON)
├── final_rating (1-5 scale)
├── submitted_at
├── created_at

ReviewPerformanceHistory
├── id
├── employee_id
├── review_cycle_id
├── performance_score
├── rating
├── feedback_summary
├── created_at
```

**API Endpoints:**
```
POST   /api/v1/review-cycles        # Create cycle
GET    /api/v1/review-cycles        # List cycles
POST   /api/v1/review-cycles/:id/trigger  # Send cycle emails
GET    /api/v1/review-forms         # Get forms for user
POST   /api/v1/review-forms/:id/submit    # Submit form
GET    /api/v1/review-history       # Get performance history
```

---

### 4.4 Feedback Service

**Responsibilities:**
- Store feedback submissions
- Cross-share feedback between employee and manager
- Track feedback history
- Link feedback to goals
- Support versioning

**Key Entities:**
```
Feedback
├── id
├── source_id (whoever submitted)
├── target_id (whoever it's about)
├── feedback_type (SELF, MANAGER, PEER)
├── related_to_id (goal_id or review_cycle_id)
├── content
├── rating (optional, 1-5)
├── is_shared
├── shared_at
├── created_at

FeedbackVersion
├── id
├── feedback_id
├── version_number
├── content
├── created_at
```

---

### 4.5 Authentication & Authorization Service

**Responsibilities:**
- User login/logout
- Token generation (JWT)
- Role-based access control (RBAC)
- Permission validation
- Session management

**Key Entities:**
```
User
├── id
├── email
├── first_name
├── last_name
├── password_hash
├── role (EMPLOYEE, MANAGER, ADMIN)
├── manager_id (nullable, links to direct manager)
├── department_id
├── date_of_joining
├── is_active
├── created_at
├── updated_at

RolePermission
├── id
├── role
├── permission
├── resource
└── action (CREATE, READ, UPDATE, DELETE)
```

**Role Permissions Matrix:**
```
ROLE: EMPLOYEE
├── Goals: Create own, Read own, Update own (draft), Submit own
├── Feedback: Submit self-feedback, Read received feedback
└── Reviews: Submit self-review, View history

ROLE: MANAGER
├── Goals: Create, Read team/own, Approve/Reject team
├── Feedback: Submit manager feedback, View team feedback
├── Reviews: Submit manager feedback for team, Set ratings
└── Escalations: View pending approvals, View alerts

ROLE: ADMIN
├── Goals: All operations on all goals
├── Feedback: View all feedback, Flag responses
├── Reviews: Trigger cycles, View compliance, Generate reports
├── Users: Manage user accounts, Assign roles
└── Reporting: Access all dashboards, Compliance views
```

---

### 4.6 Notification Service

**Responsibilities:**
- Send email notifications
- Schedule reminder notifications
- Track notification delivery
- Handle escalation alerts

**Notification Types:**
```
Probation Triggers
├── Day 30 email
├── Day 60 email
├── Day 80 email
└── Escalation notice

Goal Management
├── Goal submitted for approval (to Manager)
├── Goal approved/rejected (to Employee)
└── Ready for review (to Manager)

Performance Reviews
├── Cycle started (to all employees)
├── Self-review reminder (to Employee)
├── Manager feedback request (to Manager)
└── Cross-share notification (to both)

System Alerts
├── Escalation notice (to Admin)
├── Deadline approaching (to relevant users)
└── Compliance report (to Admin)
```

---

## 5. Frontend Architecture

### 5.1 Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Button.tsx
│   │   ├── goal/
│   │   │   ├── GoalForm.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalList.tsx
│   │   │   └── GoalProgress.tsx
│   │   ├── probation/
│   │   │   ├── ProbationForm.tsx
│   │   │   ├── ProbationStatus.tsx
│   │   │   └── ProgressTracker.tsx
│   │   ├── review/
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── ReviewHistory.tsx
│   │   │   └── PerformanceRating.tsx
│   │   └── dashboard/
│   │       ├── EmployeeDashboard.tsx
│   │       ├── ManagerDashboard.tsx
│   │       └── AdminDashboard.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Goals.tsx
│   │   ├── Reviews.tsx
│   │   ├── Probation.tsx
│   │   ├── Feedback.tsx
│   │   └── Profile.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── goal.service.ts
│   │   ├── probation.service.ts
│   │   ├── review.service.ts
│   │   └── notification.service.ts
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── goal.store.ts
│   │   ├── probation.store.ts
│   │   └── ui.store.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGoals.ts
│   │   └── useNotifications.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── goal.types.ts
│   │   ├── probation.types.ts
│   │   ├── review.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── dateHelpers.ts
│   │   └── constants.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── theme.css
│   │   └── variables.css
│   ├── App.tsx
│   └── main.tsx
├── public/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 5.2 Page Routing Structure
```
/
├── /auth
│   ├── /login
│   └── /logout
├── /dashboard
│   ├── /employee (role-based rendition)
│   ├── /manager
│   └── /admin
├── /goals
│   ├── / (list)
│   ├── /create
│   ├── /:id (detail)
│   ├── /:id/edit
│   ├── /:id/approve
│   └── /:id/progress
├── /probation
│   ├── / (status)
│   ├── /forms/:id (form submission)
│   └── /history
├── /reviews
│   ├── / (active cycles)
│   ├── /:cycleId/form (submit form)
│   └── /history
├── /feedback
│   ├── / (received)
│   └── /:id (view feedback)
└── /profile
    └── /settings
```

### 5.3 State Management Pattern
```
Zustand/Redux Store Structure:
├── auth (user, token, role, permissions)
├── goals (list, selected, filters)
├── probation (status, triggers, forms)
├── reviews (cycles, forms, submissions)
├── notifications (list, unread count)
└── ui (theme, sidebar state, modals)
```

---

## 6. Database Schema (Normalized)

### Users & Auth
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  password_hash VARCHAR,
  role ENUM(EMPLOYEE, MANAGER, ADMIN),
  manager_id UUID REFERENCES users,
  department_id UUID,
  date_of_joining DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE roles_permissions (
  id UUID PRIMARY KEY,
  role ENUM(EMPLOYEE, MANAGER, ADMIN),
  permission VARCHAR,
  resource VARCHAR,
  action VARCHAR
);
```

### Goals
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  hierarchy_level ENUM(COMPANY, TEAM, INDIVIDUAL),
  parent_id UUID REFERENCES goals,
  owner_id UUID REFERENCES users,
  weightage DECIMAL(5,2),
  status ENUM(DRAFT, PENDING_APPROVAL, ACTIVE, COMPLETED, ARCHIVED),
  created_by UUID REFERENCES users,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE goal_approvals (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES goals,
  approver_id UUID REFERENCES users,
  approval_status ENUM(PENDING, APPROVED, REJECTED),
  feedback TEXT,
  approved_at TIMESTAMP
);

CREATE TABLE goal_progress (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES goals,
  completion_percentage INT,
  notes TEXT,
  updated_by UUID REFERENCES users,
  updated_at TIMESTAMP
);
```

### Probation
```sql
CREATE TABLE probation_records (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES users,
  date_of_joining DATE,
  probation_status ENUM(IN_PROBATION, COMPLETED, REJECTED, PAUSED),
  is_paused BOOLEAN DEFAULT false,
  pause_start_date DATE,
  pause_resume_date DATE,
  created_at TIMESTAMP
);

CREATE TABLE probation_triggers (
  id UUID PRIMARY KEY,
  probation_record_id UUID REFERENCES probation_records,
  trigger_day INT (30, 60, 80),
  trigger_date DATE,
  status ENUM(PENDING, TRIGGERED, SUBMITTED, ESCALATED),
  employee_form_id UUID,
  manager_form_id UUID,
  created_at TIMESTAMP
);

CREATE TABLE probation_feedback (
  id UUID PRIMARY KEY,
  probation_trigger_id UUID REFERENCES probation_triggers,
  submitted_by_id UUID REFERENCES users,
  feedback_type ENUM(SELF, MANAGER),
  form_data JSONB,
  submitted_at TIMESTAMP
);
```

### Reviews
```sql
CREATE TABLE review_cycles (
  id UUID PRIMARY KEY,
  cycle_name VARCHAR,
  cycle_type ENUM(QUARTERLY, BI_ANNUAL, PROBATION),
  start_date DATE,
  end_date DATE,
  self_review_deadline DATE,
  manager_review_deadline DATE,
  status ENUM(PENDING, ACTIVE, CLOSED),
  created_by_id UUID REFERENCES users,
  created_at TIMESTAMP
);

CREATE TABLE review_forms (
  id UUID PRIMARY KEY,
  review_cycle_id UUID REFERENCES review_cycles,
  employee_id UUID REFERENCES users,
  manager_id UUID REFERENCES users,
  form_type ENUM(SELF_ASSESSMENT, MANAGER_FEEDBACK),
  status ENUM(PENDING, IN_PROGRESS, SUBMITTED),
  form_data JSONB,
  final_rating INT,
  submitted_at TIMESTAMP
);
```

### Feedback
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES users,
  target_id UUID REFERENCES users,
  feedback_type ENUM(SELF, MANAGER, PEER),
  related_to_id UUID,
  content TEXT,
  rating INT,
  is_shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMP,
  created_at TIMESTAMP
);
```

---

## 7. API Design Principles

### Request/Response Format
```json
{
  "status": "success|error",
  "data": { /* actual payload */ },
  "message": "Human-readable message",
  "timestamp": "2026-03-27T10:30:00Z",
  "errors": [ /* validation errors */ ]
}
```

### Authentication
```
Header: Authorization: Bearer <JWT_TOKEN>
JWT Payload: { userId, role, permissions, exp }
```

### Pagination
```
Query: ?page=1&limit=20&sort=created_at&order=desc
Response: { data: [], pagination: { total, page, pages, limit } }
```

### Filtering & Search
```
Goals: ?status=ACTIVE&hierarchy_level=INDIVIDUAL&owner_id=xxx
Probation: ?status=IN_PROBATION&department_id=xxx
Reviews: ?cycle_type=QUARTERLY&year=2026
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- [ ] Backend setup (Node.js, Express/NestJS, DB)
- [ ] Frontend setup (React + TypeScript + Vite)
- [ ] Authentication & Authorization service
- [ ] Database schema creation
- [ ] API Gateway setup
- [ ] Basic UI layout & routing

**Deliverable:** Working login + Auth flow

### Phase 2: Core Goal Management (Weeks 4-6)
- [ ] Goal Service API implementation
- [ ] Goal CRUD endpoints
- [ ] Approval workflow logic
- [ ] Weightage validation
- [ ] Frontend: Goal creation & list pages
- [ ] Frontend: Goal approval interface

**Deliverable:** Complete goal management workflow

### Phase 3: Probation System (Weeks 7-9)
- [ ] Probation Service API
- [ ] Scheduler setup for trigger logic
- [ ] Probation form triggers
- [ ] Reminder & escalation logic
- [ ] Notification Service integration
- [ ] Frontend: Probation dashboard & forms

**Deliverable:** Automated probation workflow

### Phase 4: Performance Reviews (Weeks 10-12)
- [ ] Review Service API
- [ ] Review cycle management
- [ ] Self-assessment forms
- [ ] Manager feedback forms
- [ ] Feedback cross-sharing logic
- [ ] Frontend: Review interfaces

**Deliverable:** Complete review cycle workflow

### Phase 5: Dashboards & Analytics (Weeks 13-15)
- [ ] Employee dashboard
- [ ] Manager dashboard
- [ ] Admin dashboard
- [ ] Analytics & reporting
- [ ] Real-time notifications
- [ ] Performance optimization

**Deliverable:** Role-specific dashboards

### Phase 6: Testing & Deployment (Weeks 16-18)
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation
- [ ] Docker containerization
- [ ] Production deployment

**Deliverable:** Fully deployed system

---

## 9. Key Workflows & State Machines

### 9.1 Goal Workflow
```
┌─────────────────────────────────────────────────────────┐
│ DRAFT                                                   │
│ (Created by Employee or Manager)                        │
└──────────────┬──────────────────────────────────────────┘
               │ submit for approval
               ▼
┌─────────────────────────────────────────────────────────┐
│ PENDING_APPROVAL                                        │
│ (Awaiting Manager/Admin approval)                       │
└──┬──────────────────────────────┬──────────────────────┘
   │ reject                       │ approve
   │                              ▼
   │                  ┌──────────────────────────┐
   │                  │ ACTIVE                   │
   │                  │ (Can update progress)    │
   │                  └──────┬───────────────────┘
   │                         │ mark complete
   │                         ▼
   │                  ┌──────────────────────────┐
   │                  │ COMPLETED                │
   │                  │ (Cycle end or manual)    │
   │                  └──────┬───────────────────┘
   │                         │ archive
   │                         ▼
   │                  ┌──────────────────────────┐
   │                  │ ARCHIVED                 │
   │                  │ (Historical record)      │
   │                  └──────────────────────────┘
   │
   └──────────────► DRAFT (Edit & resubmit)
```

### 9.2 Probation Workflow
```
Employee Joins (DOJ tracked)
       │
       ▼ (Day 30 reached)
Forms Triggered
├── Employee self-feedback form
└── Manager feedback form
       │
       ▼ (User submits)
Submitted (awaiting peer)
       │
       ├─ If NOT submitted after 7 days: ESCALATE to Admin
       │        ├── Reminder 1: +2 days
       │        ├── Reminder 2: +4 days
       │        ├── Reminder 3: +6 days
       │        └── Escalate: +7 days
       │
       └─ Once both submitted: CROSS-SHARE feedback
       │
       ▼ (Repeat for Day 60 & Day 80)
Final Status:
├── On Day 85-90: Admin reviews & shares insights
├── Probation Confirmed: Employee cleared
└── Probation Rejected: Employee offboarding
```

### 9.3 Review Cycle Workflow
```
Admin Initiates Cycle (e.g., Q1 2026)
       │
       ▼
Email Trigger: Notify all in cycle
       │
       ▼
Self-Review Phase
├── Employees complete self-assessment
└── Deadline: specified date
       │
       ▼
Manager Review Phase
├── Managers review employee self-assessment
├── Provide manager feedback
└── Set final rating
       │
       ▼
Feedback Cross-Share
├── Both submitted: Share results
└── Pending: Send reminders
       │
       ▼
Close Cycle
└── Store performance history
```

---

## 10. Critical Integration Points

### 10.1 Notification Triggers
```
Probation Service  ──► Notification Service ──► Email Queue
Goal Service       ──► Notification Service ──► Email Queue
Review Service     ──► Notification Service ──► Email Queue
Escalation Rules   ──► Notification Service ──► Priority Queue
```

### 10.2 Data Flow Between Services
```
1. Goal Service ──► Review Service (link goals to reviews)
2. Probation Service ──► User Service (DOJ tracking)
3. Feedback Service ──► Goal/Review Service (link feedback)
4. Auth Service ──► All Services (RBAC verification)
```

### 10.3 Real-Time Updates
```
Frontend ─────► WebSocket ─────► Backend
                        ↓
            (Notifications, approvals, status updates)
```

---

## 11. Non-Functional Requirements

| Requirement | Target | Implementation |
|--|--|--|
| **Performance** | API response < 200ms | Caching, indexing, query optimization |
| **Availability** | 99.5% uptime | Load balancing, failover |
| **Security** | JWT auth + RBAC | SSL/TLS, password hashing, rate limiting |
| **Scalability** | Handle 10K concurrent users | Horizontal scaling, CDN, database sharding |
| **Data Backup** | Daily automated backups | Database replication, incremental backups |
| **Audit Trail** | Log all critical actions | Immutable audit logs, admin access logs |
| **Compliance** | GDPR-ready | Data anonymization, export capabilities |

---

## 12. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN (CloudFront)                      │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Load Balancer                            │
└────────────┬────────────────────────┬──────────────────────┘
             │                        │
┌────────────▼─────┐     ┌───────────▼──────┐
│  Backend Pod 1   │     │  Backend Pod 2   │
│  (API Service)   │     │  (API Service)   │
└────────┬─────────┘     └───────┬──────────┘
         │                       │
         └───────────┬───────────┘
                     │
          ┌──────────▼──────────┐
          │   PostgreSQL DB     │
          │ (Read Replicas)     │
          └─────────────────────┘
          
          ┌──────────────────────┐
          │   Redis Cache        │
          │ (Session + Data)     │
          └─────────────────────┘
          
          ┌──────────────────────┐
          │   Message Queue      │
          │ (Job Scheduler)      │
          └─────────────────────┘
```

---

## 13. Development Workflow

### 13.1 Git Strategy
```
main (production)
  ├── develop (staging)
  │   ├── feature/goal-service
  │   ├── feature/probation-triggers
  │   ├── feature/review-forms
  │   └── bugfix/notification-logic
```

### 13.2 Testing Strategy
```
Frontend:
  ├── Jest unit tests (components, utilities)
  ├── React Testing Library (component integration)
  ├── E2E tests (Cypress/Playwright)

Backend:
  ├── Jest unit tests (services, utilities)
  ├── Integration tests (API endpoints)
  ├── API contract tests (request/response validation)
```

### 13.3 Code Quality
```
- ESLint + TypeScript strict mode
- Pre-commit hooks (husky + lint-staged)
- PR reviews with checklist
- Automated CI/CD pipeline
```

---

## 14. Risk Mitigation

| Risk | Impact | Mitigation |
|--|--|--|
| Scope Creep | Schedule delay | Well-defined phases, strict PRD |
| Data Loss | Business continuity | Automated backups, disaster recovery plan |
| Performance Issues | User satisfaction | Load testing, query optimization early |
| Security Breach | Compliance + reputation | Security audit, penetration testing |
| Integration Complexity | Delivery delay | Clear API contracts, early integration testing |
| Resource Constraints | Quality issues | Proper staffing, knowledge sharing |

---

## 15. Success Metrics

- **Probation processing automation:** 100% of Day 30/60/80 triggers automated, zero manual intervention
- **Form completion rate:** > 85% before escalation
- **System availability:** 99.5% uptime
- **API response time:** 95th percentile < 200ms
- **User adoption:** > 80% active monthly users within 3 months
- **Data accuracy:** Zero reported data discrepancies post-launch

---

## Next Steps

1. **Review & Validate:** Stakeholder review of HLD
2. **Tech Selection:** Confirm backend framework, state management, UI library
3. **Team Allocation:** Assign developers to services
4. **Setup Infrastructure:** Database, CI/CD, development environments
5. **Sprint Planning:** Create detailed sprint backlog for Phase 1

---

**Document Owner:** Architecture Team  
**Last Updated:** March 27, 2026  
**Next Review:** After Phase 1 completion
