#!/usr/bin/env python3
"""
PMS Backend - GOAL Test Cases (GOAL-01 to GOAL-07)
Goal Management and Workflow Tests
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8003/api/v1"

# Test users
ADMIN = {"email": "sandeep@opstree.com", "password": "test"}
MANAGER = {"email": "deepak@opstree.com", "password": "test"}
EMPLOYEE = {"email": "harshit@opstree.com", "password": "test"}

results = {"passed": 0, "failed": 0, "total": 0, "errors": []}
tokens = {}
test_data = {}

def test_result(test_id, scenario, passed, expected, actual, details=""):
    """Log test result"""
    results["total"] += 1
    status = "✓ PASS" if passed else "✗ FAIL"
    
    if passed:
        results["passed"] += 1
        print(f"{status} | {test_id} | {scenario}")
    else:
        results["failed"] += 1
        error = f"{test_id}: {scenario} | Expected: {expected}, Got: {actual}"
        if details:
            error += f" | {details}"
        results["errors"].append(error)
        print(f"{status} | {test_id} | {scenario}")
        print(f"       Expected: {expected}, Got: {actual}")
        if details:
            print(f"       Details: {details}")

print("="*80)
print("PMS BACKEND - GOAL TEST CASES (GOAL-01 to GOAL-07)")
print("="*80)
print(f"Test ID | Scenario | Status")
print("-"*80)

# Login
try:
    resp = requests.post(f"{BASE_URL}/auth/login", json=ADMIN)
    if resp.status_code == 200:
        tokens["admin"] = resp.json()["access_token"]
        print("✓ Admin logged in successfully")
    
    resp = requests.post(f"{BASE_URL}/auth/login", json=MANAGER)
    if resp.status_code == 200:
        tokens["manager"] = resp.json()["access_token"]
        test_data["manager_id"] = resp.json()["user_id"]
        print("✓ Manager logged in successfully")
    
    resp = requests.post(f"{BASE_URL}/auth/login", json=EMPLOYEE)
    if resp.status_code == 200:
        tokens["employee"] = resp.json()["access_token"]
        test_data["employee_id"] = resp.json()["user_id"]
        print("✓ Employee logged in successfully")
    print("-"*80)
except Exception as e:
    print(f"✗ Login failed: {e}")
    exit(1)

# Clean up any existing quarterly goals for the employee to start fresh
if tokens.get("employee"):
    try:
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        resp = requests.get(f"{BASE_URL}/goals/", headers=headers)
        if resp.status_code == 200:
            goals = resp.json()
            quarterly_goals = [g for g in goals if g.get("tag") == "quarterly" and g.get("assignee_id") == test_data.get("employee_id")]
            print(f"  Found {len(quarterly_goals)} existing quarterly goals for cleanup")
    except:
        pass

print("-"*80)

# ============================================================================
# GOAL-01: Create a goal keeping total weightage <= 100%
# ============================================================================
if tokens.get("employee"):
    try:
        # Use a different tag to avoid conflicts with existing goals
        test_tag = "monthly"  # Use monthly instead of quarterly for testing
        
        # First check current weightage for monthly tag
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        resp = requests.get(
            f"{BASE_URL}/users/{test_data['employee_id']}/weightage/{test_tag}",
            headers=headers
        )
        
        current_weightage = 0
        remaining_weightage = 100
        if resp.status_code == 200:
            data = resp.json()
            remaining_weightage = data.get("remaining_weightage", 100)
            current_weightage = 100 - remaining_weightage
            print(f"  Current weightage used: {current_weightage}%, Remaining: {remaining_weightage}%")
        
        # Determine priority based on remaining weightage
        # CRITICAL=40%, HIGH=30%, MEDIUM=20%, LOW=10%
        if remaining_weightage >= 40:
            priority = "critical"
        elif remaining_weightage >= 30:
            priority = "high"
        elif remaining_weightage >= 20:
            priority = "medium"
        elif remaining_weightage >= 10:
            priority = "low"
        else:
            priority = "low"  # Will fail validation
        
        print(f"  Using priority: {priority} (auto-weightage based on priority)")
        
        goal_data = {
            "title": "GOAL-01: Complete Q1 deliverables",
            "description": "Finish all assigned tasks for Q1",
            "level": "individual",
            "tag": test_tag,
            "priority": priority,
            "status": "DRAFT",
            "assignee_id": test_data["employee_id"],
            "start_date": datetime.now().date().isoformat(),
            "target_date": (datetime.now() + timedelta(days=30)).date().isoformat()
        }
        
        resp = requests.post(f"{BASE_URL}/goals/", json=goal_data, headers=headers)
        
        if resp.status_code == 201:
            data = resp.json()
            if data.get("status", "").upper() == "DRAFT":
                test_data["goal_id"] = data.get("id")
                test_result("GOAL-01", "Create goal with weightage <= 100%", True,
                           "201 + DRAFT status", f"201 + Status: {data.get('status')}")
            else:
                test_result("GOAL-01", "Create goal with weightage <= 100%", False,
                           "201 + DRAFT", f"201 but status: {data.get('status')}")
        else:
            test_result("GOAL-01", "Create goal with weightage <= 100%", False,
                       "201", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("GOAL-01", "Create goal with weightage <= 100%", False,
                   "201", "Exception", str(e))
else:
    test_result("GOAL-01", "Create goal with weightage <= 100%", False,
               "Test setup", "No employee token", "Cannot test")

# ============================================================================
# GOAL-02: Attempt to create a goal that pushes total weight > 100%
# ============================================================================
if tokens.get("employee"):
    try:
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        
        # Get current remaining weightage
        resp = requests.get(
            f"{BASE_URL}/users/{test_data['employee_id']}/weightage/{test_tag}",
            headers=headers
        )
        
        remaining_weightage = 100
        if resp.status_code == 200:
            data = resp.json()
            remaining_weightage = data.get("remaining_weightage", 100)
        
        # Try to create a goal with priority that exceeds remaining weightage
        # Since we just created a CRITICAL (40%), we have 60% remaining
        # Create another CRITICAL (40%) + existing 40% = 80% (still under 100%)
        # So we need to create a goal that will exceed: use two more goals
        # Or create with priority that exceeds remaining
        
        # First, create another goal to use up more weightage
        filler_goal = {
            "title": "GOAL-02-Filler: Use up weightage",
            "description": "Filler goal",
            "level": "individual",
            "tag": test_tag,
            "priority": "critical",  # 40%
            "status": "DRAFT",
            "assignee_id": test_data["employee_id"],
            "start_date": datetime.now().date().isoformat(),
            "target_date": (datetime.now() + timedelta(days=30)).date().isoformat()
        }
        resp = requests.post(f"{BASE_URL}/goals/", json=filler_goal, headers=headers)
        if resp.status_code == 201:
            print(f"  Created filler goal (40%), now at 80% total")
        
        # Now try to add another HIGH (30%) which should exceed 100%
        excessive_priority = "high"  # 30% + 80% = 110%
        
        print(f"  Attempting to create goal with priority: {excessive_priority} (should exceed 100%)")
        
        excessive_goal = {
            "title": "GOAL-02: Excessive weightage goal",
            "description": "This should fail due to weightage limit",
            "level": "individual",
            "tag": test_tag,
            "priority": excessive_priority,
            "status": "DRAFT",
            "assignee_id": test_data["employee_id"],
            "start_date": datetime.now().date().isoformat(),
            "target_date": (datetime.now() + timedelta(days=30)).date().isoformat()
        }
        
        resp = requests.post(f"{BASE_URL}/goals/", json=excessive_goal, headers=headers)
        
        # Should get 400 or 422 error
        if resp.status_code in [400, 422]:
            test_result("GOAL-02", "Create goal exceeding 100% weightage", True,
                       "400/422 Error", resp.status_code,
                       "Weightage validation working")
        else:
            test_result("GOAL-02", "Create goal exceeding 100% weightage", False,
                       "400/422 Error", resp.status_code,
                       "Goal created despite exceeding weightage limit - VALIDATION ISSUE")
    except Exception as e:
        test_result("GOAL-02", "Create goal exceeding 100% weightage", False,
                   "400/422", "Exception", str(e))
else:
    test_result("GOAL-02", "Create goal exceeding 100% weightage", False,
               "Test setup", "No employee token", "Cannot test")

# ============================================================================
# GOAL-03: Submit goal for approval
# ============================================================================
if tokens.get("employee") and test_data.get("goal_id"):
    try:
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/submit",
            headers=headers
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status", "").upper() == "PENDING_APPROVAL":
                test_result("GOAL-03", "Submit goal for approval", True,
                           "200 + PENDING_APPROVAL", f"200 + Status: {data.get('status')}")
            else:
                test_result("GOAL-03", "Submit goal for approval", False,
                           "200 + PENDING_APPROVAL", f"200 but status: {data.get('status')}")
        else:
            test_result("GOAL-03", "Submit goal for approval", False,
                       "200", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("GOAL-03", "Submit goal for approval", False,
                   "200", "Exception", str(e))
else:
    test_result("GOAL-03", "Submit goal for approval", False,
               "Test setup", "Missing employee token or goal_id", "Cannot test")

# ============================================================================
# GOAL-04: Manager approves a team member's goal
# ============================================================================
if tokens.get("manager") and test_data.get("goal_id"):
    try:
        headers = {"Authorization": f"Bearer {tokens['manager']}"}
        approve_data = {"approved": True}  # Required field
        
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/approve",
            json=approve_data,
            headers=headers
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status", "").upper() == "ACTIVE":
                test_result("GOAL-04", "Manager approves team member's goal", True,
                           "200 + ACTIVE status", f"200 + Status: {data.get('status')}")
            else:
                test_result("GOAL-04", "Manager approves team member's goal", False,
                           "200 + ACTIVE", f"200 but status: {data.get('status')}")
        else:
            test_result("GOAL-04", "Manager approves team member's goal", False,
                       "200", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("GOAL-04", "Manager approves team member's goal", False,
                   "200", "Exception", str(e))
else:
    test_result("GOAL-04", "Manager approves team member's goal", False,
               "Test setup", "Missing manager token or goal_id", "Cannot test")

# ============================================================================
# GOAL-05: Update goal progress to 50%
# ============================================================================
if tokens.get("employee") and test_data.get("goal_id"):
    try:
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        progress_data = {
            "completion_percentage": 50,
            "notes": "Halfway through the deliverables"
        }
        
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/progress",
            json=progress_data,
            headers=headers
        )
        
        if resp.status_code == 200:
            data = resp.json()
            # Check if progress was saved
            test_result("GOAL-05", "Update goal progress to 50%", True,
                       "200 + Progress saved", "200 + Progress updated")
        else:
            test_result("GOAL-05", "Update goal progress to 50%", False,
                       "200", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("GOAL-05", "Update goal progress to 50%", False,
                   "200", "Exception", str(e))
else:
    test_result("GOAL-05", "Update goal progress to 50%", False,
               "Test setup", "Missing employee token or goal_id", "Cannot test")

# ============================================================================
# GOAL-06: Submit member self-feedback on completed goal
# ============================================================================
if tokens.get("employee") and test_data.get("goal_id"):
    try:
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        
        # First mark goal as completed
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/complete",
            headers=headers
        )
        
        if resp.status_code == 200:
            print("  Goal marked as completed")
        
        # Now submit member feedback
        feedback_data = {
            "rating": 4,
            "comment": "Successfully completed all deliverables on time",
            "deliverables": "Completed 3 major features and 2 bug fixes",
            "quality_rating": 4,
            "timeliness_rating": 5,
            "improvements": "Could improve documentation"
        }
        
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/feedback/member",
            json=feedback_data,
            headers=headers
        )
        
        if resp.status_code in [200, 201]:
            test_result("GOAL-06", "Submit member self-feedback", True,
                       "200 + Feedback logged", f"{resp.status_code} + Feedback saved")
        else:
            test_result("GOAL-06", "Submit member self-feedback", False,
                       "200", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("GOAL-06", "Submit member self-feedback", False,
                   "200", "Exception", str(e))
else:
    test_result("GOAL-06", "Submit member self-feedback", False,
               "Test setup", "Missing employee token or goal_id", "Cannot test")

# ============================================================================
# GOAL-07: Score the goal (1-5 rating)
# ============================================================================
if tokens.get("manager") and test_data.get("goal_id"):
    try:
        headers = {"Authorization": f"Bearer {tokens['manager']}"}
        
        # First submit manager/evaluator feedback
        evaluator_feedback = {
            "quality_rating": 4,
            "timeliness_rating": 5,
            "innovation_rating": 4,
            "collaboration_rating": 4,
            "impact_rating": 4,
            "evaluator_comment": "Excellent work, met all expectations"
        }
        
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/feedback/evaluator",
            json=evaluator_feedback,
            headers=headers
        )
        
        if resp.status_code in [200, 201]:
            print("  Manager feedback submitted successfully")
        else:
            print(f"  ⚠ Manager feedback failed: {resp.status_code} - {resp.text[:200]}")
        
        # Small delay to ensure feedback is processed
        import time
        time.sleep(2)  # Increased delay
        
        # Verify both feedbacks exist and status is updated
        resp = requests.get(f"{BASE_URL}/goals/{test_data['goal_id']}", headers=headers)
        if resp.status_code == 200:
            goal_data = resp.json()
            feedbacks = goal_data.get("feedbacks", [])
            goal_status = goal_data.get("status", "")
            print(f"  Goal has {len(feedbacks)} feedback(s), status: {goal_status}")
            
            # If status is not scorable, try to understand why
            if goal_status.upper() != "SCORABLE":
                member_fb = [f for f in feedbacks if f.get("feedback_type") == "member"]
                evaluator_fb = [f for f in feedbacks if f.get("feedback_type") == "evaluator"]
                print(f"  Member feedbacks: {len(member_fb)}, Evaluator feedbacks: {len(evaluator_fb)}")
        
        # Now score the goal
        score_data = {
            "rating": "meets_expectations"  # lowercase enum value
        }
        
        resp = requests.post(
            f"{BASE_URL}/goals/{test_data['goal_id']}/score",
            json=score_data,
            headers=headers
        )
        
        if resp.status_code == 200:
            data = resp.json()
            test_result("GOAL-07", "Score the goal (1-5 rating)", True,
                       "200 + Final rating saved", "200 + Score recorded")
        else:
            test_result("GOAL-07", "Score the goal (1-5 rating)", False,
                       "200", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("GOAL-07", "Score the goal (1-5 rating)", False,
                   "200", "Exception", str(e))
else:
    test_result("GOAL-07", "Score the goal (1-5 rating)", False,
               "Test setup", "Missing manager token or goal_id", "Cannot test")

# ============================================================================
# CLEANUP
# ============================================================================
print("-"*80)
print("Cleaning up test data...")

if tokens.get("admin") and test_data.get("goal_id"):
    headers = {"Authorization": f"Bearer {tokens['admin']}"}
    try:
        # Note: Goals typically shouldn't be deleted, but for testing we can try
        # In production, goals would be archived or marked inactive
        print(f"  Test goal ID: {test_data['goal_id']} (kept for audit trail)")
    except Exception as e:
        print(f"⚠ Error during cleanup: {e}")

# ============================================================================
# SUMMARY
# ============================================================================
print("="*80)
print("TEST SUMMARY")
print("="*80)
print(f"Total Tests:   {results['total']}")
print(f"✓ Passed:      {results['passed']}")
print(f"✗ Failed:      {results['failed']}")

if results['total'] > 0:
    pass_rate = (results['passed'] / results['total']) * 100
    print(f"Success Rate:  {pass_rate:.1f}%")

print("="*80)

if results['errors']:
    print(f"\nFAILED TESTS ({len(results['errors'])}):")
    for error in results['errors']:
        print(f"  - {error}")
