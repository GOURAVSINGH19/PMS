# Goal Management System (GMS)

## Business Flow Document (MVP)

### Purpose

The Goal Management System (GMS) provides a structured workflow to define, approve, track, and evaluate goals across the organization. It ensures alignment between company objectives, team deliverables, and individual performance.

---

## 1. System Overview

GMS operates on a structured lifecycle:

**Create → Approver Review → Active Tracking → Completion → Feedback → Scoring → Reporting**

The system enforces accountability, transparency, and measurable performance outcomes.

---

## 2. Actors & Roles

### Team Member

* Creates and manages individual goals
* Tracks progress
* Submits self-reflection feedback
* Views own performance

### Evaluator / Manager

* Approves or rejects goals
* Monitores team progress
* Provides feedback and scores goals
* Views team performance reports

### Leadership / Admin

* Configures teams and users
* Views organization-wide performance
* Exorts company reports

---

## 3. Goal Lifecycle Workflow

### Step 1: Goal Creation

**Actor:** Member / Evaluator
**Status:** Draft

User creates a goal with:

* Title & description
* Level (Company / Team / Individual)
* Due date
* Weightage (%)
* Category tag

User submits goal → status becomes **Pending Approval**.

---

### Step 2: Approval Process

**Actor:** Evaluator

Evaluator reviews goal and chooses:

✔ Approve → status becomes **Active**
❌ Reject → status becomes **Rejected** (comment mandatory)

Rejected goals can be edited and resubmitted.

---

### Step 3: Active Goal Tracking

**Actor:** Member

* Updates completion %
* Adds notes (optional)
* Views progress bar

**System Logic:**

* Goal locked from editing
* At-risk detection runs automatically

---

### Step 4: At-Risk Detection

A goal is flagged **At Risk** when:

* More than 70% of timeline elapsed
  AND
* Less than 50% completion

At-risk goals appear on dashboards.

---

### Step 5: Goal Completion

**Actor:** Member

When work is finished:

* completion set to 100%
* goal marked complete
* system triggers feedback workflow

Status becomes **Completed (Awaiting Feedback)**.

---

### Step 6: Mandatory Feedback Submission

#### Member Feedback (Self Reflection)

Member answers:

* What did you deliver?
* What would you improve?

#### Evaluator Feedback

Evaluator submits:

* Ratings:

  * Quality
  * Ownership
  * Communication
  * Timeliness
  * Initiative
* Comment

⚠️ Both submissions are required before scoring.

---

### Step 7: Goal Scoring & Locking

**Actor:** Evaluator

Evaluator assigns final rating:

* Below Expectations
* Meets Expectations
* Above Expectations

After scoring:

* Goal is locked
* Feedback cannot be edited
* Score updates dashboards & reports

Status becomes **Scored (Closed)**.

---

## 4. Goal Status Flow

Draft
→ Pending Approval
→ Active
→ Completed
→ Feedback Submitted
→ Scorable
→ Scored (Closed)

OR

Pending Approval → Rejected → Draft

---

## 5. Dashboard & Monitoring Flow

### Individual Dashboard

Displays:

* Total goals
* Completion %
* At-risk goals
* Average score

### Team Dashboard

Displays:

* Team completion rate
* Goal distribution by status
* At-risk goals
* Team performance snapshot

### Company Dashboard

Displays:

* Team performance comparison
* Completion trends
* Score distribution

---

## 6. Reporting Flow

Reports can be generated for a selected period.

### Individual Report

* Goal summary
* Completion %
* Feedback & scores

### Team Report

* Team performance metrics
* Top & bottom performers
* Completion rates

### Company Report

* Team comparisons
* Goal completion trends

Reports can be exported as **PDF or CSV**.

---

## 7. Business Rules & Controls

### Goal Rules

* Required fields must be completed before submission
* Goals editable only in Draft or Rejected state
* Weightage validation enforced

### Approval Rules

* Only evaluators can approve or reject goals
* Rejection requires comment

### Feedback Rules

* Scoring blocked until both parties submit feedback

### Locking Rules

* Scored goals cannot be modified

---

## 8. Exception Handling

System must handle:

* overdue goals with incomplete progress
* resubmitted rejected goals
* missing feedback preventing scoring
* due date passed with low completion

---

## 9. Success Metrics

The system improves performance management by:

* creating a single source of truth
* enabling transparent evaluation
* ensuring mandatory feedback
* providing real-time performance insights
* identifying at-risk goals early

---

## 10. End-to-End Flow Summary

1. Goal created & submitted
2. Evaluator approves
3. Member tracks progress
4. System flags at-risk items
5. Goal completed
6. Both parties submit feedback
7. Evaluator scores goal
8. Dashboard & reports update

---
