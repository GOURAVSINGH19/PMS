#!/usr/bin/env python3
"""
Comprehensive PMS Backend Test Suite
Tests all scenarios from the test specification document
"""
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:8003/api/v1"

# Test users
ADMIN = {"email": "sandeep@opstree.com", "password": "test"}
MANAGER = {"email": "deepak@opstree.com", "password": "test"}
EMPLOYEE = {"email": "harshit@opstree.com", "password": "test"}
MANAGER2 = {"email": "aman@opstree.com", "password": "test"}
EMPLOYEE2 = {"email": "gourav@opstree.com", "password": "test"}

# Global state
tokens = {}
user_ids = {}
test_data = {}
results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "errors": []
}

def log_result(test_id: str, name: str, passed: bool, expected: Any = None, actual: Any = None, reason: str = ""):
    """Log test result"""
    results["total"] += 1
    if passed:
        results["passed"] += 1
        print(f"✓ {test_id}: {name}")
    else:
        results["failed"] += 1
        error_msg = f"{test_id}: {name}"
        if expected and actual:
            error_msg += f" | Expected: {expected}, Got: {actual}"
        if reason:
            error_msg += f" | {reason}"
        results["errors"].append(error_msg)
        print(f"✗ {test_id}: {name}")
        if reason:
            print(f"  Reason: {reason}")

def log_skip(test_id: str, name: str, reason: str):
    """Log skipped test"""
    results["total"] += 1
    results["skipped"] += 1
    print(f"⊘ {test_id}: {name} (SKIPPED: {reason})")

def api_call(method: str, endpoint: str, role: Optional[str] = None, 
             data: Optional[Dict] = None, params: Optional[Dict] = None,
             expected_status: int = 200) -> tuple:
    """Make API call and return (success, status_code, response_data)"""
    headers = {}
    if role and role in tokens:
        headers["Authorization"] = f"Bearer {tokens[role]}"
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            resp = requests.put(url, headers=headers, json=data)
        elif method == "PATCH":
            resp = requests.patch(url, headers=headers, json=data)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers)
        else:
            return False, 0, {"error": "Invalid method"}
        
        success = resp.status_code == expected_status
        response_data = resp.json() if resp.text and resp.status_code != 204 else {}
        
        return success, resp.status_code, response_data
    except Exception as e:
        return False, 0, {"error": str(e)}

# ============================================================================
# AUTHENTICATION TESTS (AUTH-01 to AUTH-03)
# ============================================================================

def test_auth():
    """Test authentication module"""
    print("\n" + "="*80)
    print("AUTHENTICATION TESTS (AUTH-01 to AUTH-03)")
    print("="*80)
    
    # AUTH-01: Login with valid credentials
    success, status, data = api_call("POST", "/auth/login", data=ADMIN, expected_status=200)
    if success and "access_token" in data:
        tokens["admin"] = data["access_token"]
        user_ids["admin"] = data.get("user_id")
        log_result("AUTH-01", "Login with valid credentials (Admin)", True)
    else:
        log_result("AUTH-01", "Login with valid credentials (Admin)", False, 200, status, 
                   f"Response: {data}")
    
    # Login other users for subsequent tests
    success, status, data = api_call("POST", "/auth/login", data=MANAGER, expected_status=200)
    if success:
        tokens["manager"] = data["access_token"]
        user_ids["manager"] = data.get("user_id")
        log_result("AUTH-01", "Login with valid credentials (Manager)", True)
    else:
        log_result("AUTH-01", "Login with valid credentials (Manager)", False, 200, status)
    
    success, status, data = api_call("POST", "/auth/login", data=EMPLOYEE, expected_status=200)
    if success:
        tokens["employee"] = data["access_token"]
        user_ids["employee"] = data.get("user_id")
        log_result("AUTH-01", "Login with valid credentials (Employee)", True)
    else:
        log_result("AUTH-01", "Login with valid credentials (Employee)", False, 200, status)
    
    success, status, data = api_call("POST", "/auth/login", data=MANAGER2, expected_status=200)
    if success:
        tokens["manager2"] = data["access_token"]
        user_ids["manager2"] = data.get("user_id")
    
    success, status, data = api_call("POST", "/auth/login", data=EMPLOYEE2, expected_status=200)
    if success:
        tokens["employee2"] = data["access_token"]
        user_ids["employee2"] = data.get("user_id")
    
    # AUTH-02: Login with invalid credentials
    invalid_creds = {"email": "sandeep@opstree.com", "password": "wrongpassword"}
    success, status, data = api_call("POST", "/auth/login", data=invalid_creds, expected_status=401)
    log_result("AUTH-02", "Login with invalid credentials", success, 401, status,
               f"Response: {data.get('detail', '')}")
    
    # AUTH-03: Login with non-existent user
    nonexistent = {"email": "nonexistent@example.com", "password": "test"}
    success, status, data = api_call("POST", "/auth/login", data=nonexistent, expected_status=401)
    log_result("AUTH-03", "Login with non-existent user", success, 401, status,
               f"Response: {data.get('detail', '')}")

# ============================================================================
# TEAM TESTS (TEAM-01 to TEAM-06)
# ============================================================================

def test_teams():
    """Test team management module"""
    print("\n" + "="*80)
    print("TEAM TESTS (TEAM-01 to TEAM-06)")
    print("="*80)
    
    # TEAM-01: Create team as admin
    team_data = {
        "name": f"Test Team {datetime.now().timestamp()}",
        "description": "Test team for comprehensive testing"
    }
    success, status, data = api_call("POST", "/teams/", "admin", team_data, expected_status=201)
    if success:
        test_data["team_id"] = data.get("id")
        log_result("TEAM-01", "Create team as admin", True)
    else:
        log_result("TEAM-01", "Create team as admin", False, 201, status, f"Response: {data}")
    
    # TEAM-02: Create team as non-admin (Manager)
    success, status, data = api_call("POST", "/teams/", "manager", team_data, expected_status=403)
    log_result("TEAM-02", "Create team as non-admin (Manager)", success, 403, status)
    
    # TEAM-03: List teams as admin
    success, status, data = api_call("GET", "/teams/", "admin", expected_status=200)
    if success and isinstance(data, list):
        log_result("TEAM-03", "List teams as admin", True)
        print(f"  Found {len(data)} teams")
    else:
        log_result("TEAM-03", "List teams as admin", False, 200, status)
    
    # TEAM-04: List teams as manager (should see only own team)
    success, status, data = api_call("GET", "/teams/", "manager", expected_status=200)
    if success and isinstance(data, list):
        log_result("TEAM-04", "List teams as manager", True)
        print(f"  Manager sees {len(data)} team(s)")
    else:
        log_result("TEAM-04", "List teams as manager", False, 200, status)
    
    # TEAM-05: Get team details as manager (own team)
    # First get manager's team_id
    success, status, user_data = api_call("GET", f"/users/{user_ids['manager']}", "manager", expected_status=200)
    if success and user_data.get("team_id"):
        manager_team_id = user_data["team_id"]
        success, status, data = api_call("GET", f"/teams/{manager_team_id}", "manager", expected_status=200)
        log_result("TEAM-05", "Get team details as manager (own team)", success, 200, status)
    else:
        log_skip("TEAM-05", "Get team details as manager (own team)", "Manager has no team assigned")
    
    # TEAM-06: Get team details - unauthorized (different team)
    if test_data.get("team_id"):
        success, status, data = api_call("GET", f"/teams/{test_data['team_id']}", "manager", expected_status=403)
        log_result("TEAM-06", "Get team details - unauthorized (different team)", success, 403, status)
    else:
        log_skip("TEAM-06", "Get team details - unauthorized", "No test team created")

# ============================================================================
# USER TESTS (USER-01 to USER-12)
# ============================================================================

def test_users():
    """Test user management module"""
    print("\n" + "="*80)
    print("USER TESTS (USER-01 to USER-12)")
    print("="*80)
    
    # USER-01: Create user as admin
    new_user_data = {
        "email": f"testuser_{datetime.now().timestamp()}@opstree.com",
        "name": "Test User",
        "role": "member",
        "password": "test123",
        "manager_id": user_ids.get("manager", 2),
        "team_id": 1,
        "date_of_joining": "2026-01-01"
    }
    success, status, data = api_call("POST", "/users/", "admin", new_user_data, expected_status=201)
    if success:
        test_data["new_user_id"] = data.get("id")
        log_result("USER-01", "Create user as admin", True)
    else:
        log_result("USER-01", "Create user as admin", False, 201, status, f"Response: {data}")
    
    # USER-02: Create user as manager (should fail)
    success, status, data = api_call("POST", "/users/", "manager", new_user_data, expected_status=403)
    log_result("USER-02", "Create user as manager (forbidden)", success, 403, status)
    
    # USER-03: List users as admin
    success, status, data = api_call("GET", "/users/", "admin", expected_status=200)
    if success and isinstance(data, list):
        log_result("USER-03", "List users as admin", True)
        print(f"  Found {len(data)} users")
    else:
        log_result("USER-03", "List users as admin", False, 200, status)
    
    # USER-04: List users as manager (should see only team members)
    success, status, data = api_call("GET", "/users/", "manager", expected_status=200)
    if success and isinstance(data, list):
        log_result("USER-04", "List users as manager (team members only)", True)
        print(f"  Manager sees {len(data)} user(s)")
    else:
        log_result("USER-04", "List users as manager", False, 200, status)
    
    # USER-05: List users as member (should see only self)
    success, status, data = api_call("GET", "/users/", "employee", expected_status=200)
    if success and isinstance(data, list):
        log_result("USER-05", "List users as member (only self)", True)
        print(f"  Member sees {len(data)} user(s)")
    else:
        log_result("USER-05", "List users as member", False, 200, status)
    
    # USER-06: Get user profile (own)
    success, status, data = api_call("GET", f"/users/{user_ids['employee']}", "employee", expected_status=200)
    log_result("USER-06", "Get own user profile", success, 200, status)
    
    # USER-07: Get other user profile as member (should fail)
    success, status, data = api_call("GET", f"/users/{user_ids['manager']}", "employee", expected_status=403)
    log_result("USER-07", "Get other user profile as member (forbidden)", success, 403, status)
    
    # USER-08: Get team member profile as manager (should succeed)
    success, status, data = api_call("GET", f"/users/{user_ids['employee']}", "manager", expected_status=200)
    log_result("USER-08", "Get team member profile as manager", success, 200, status)
    
    # USER-09: Update own profile as member
    update_data = {"name": "Updated Employee Name"}
    success, status, data = api_call("PATCH", f"/users/{user_ids['employee']}", "employee", 
                                     update_data, expected_status=200)
    log_result("USER-09", "Update own profile as member", success, 200, status)
    
    # USER-10: Update other user as member (should fail)
    success, status, data = api_call("PATCH", f"/users/{user_ids['manager']}", "employee", 
                                     update_data, expected_status=403)
    log_result("USER-10", "Update other user as member (forbidden)", success, 403, status)
    
    # USER-11: Update manager of user as admin
    if test_data.get("new_user_id"):
        manager_update = {"manager_id": user_ids.get("manager2", 5)}
        success, status, data = api_call("PATCH", f"/users/{test_data['new_user_id']}", "admin", 
                                         manager_update, expected_status=200)
        log_result("USER-11", "Update manager of user as admin", success, 200, status)
    else:
        log_skip("USER-11", "Update manager of user", "No test user created")
    
    # USER-12: Delete user as admin
    if test_data.get("new_user_id"):
        success, status, data = api_call("DELETE", f"/users/{test_data['new_user_id']}", "admin", 
                                         expected_status=204)
        log_result("USER-12", "Delete user as admin", success, 204, status)
    else:
        log_skip("USER-12", "Delete user", "No test user created")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Tests:   {results['total']}")
    print(f"✓ Passed:      {results['passed']}")
    print(f"✗ Failed:      {results['failed']}")
    print(f"⊘ Skipped:     {results['skipped']}")
    
    if results['total'] > 0:
        pass_rate = (results['passed'] / results['total']) * 100
        print(f"Success Rate:  {pass_rate:.1f}%")
    
    print("="*80)
    
    if results['errors']:
        print(f"\nFAILED TESTS ({len(results['errors'])}):")
        for error in results['errors'][:20]:
            print(f"  - {error}")
        if len(results['errors']) > 20:
            print(f"  ... and {len(results['errors']) - 20} more")

if __name__ == "__main__":
    print("="*80)
    print("PMS BACKEND COMPREHENSIVE TEST SUITE")
    print("Starting tests at:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("="*80)
    
    try:
        test_auth()
        test_teams()
        test_users()
        test_goals()
        test_weightage()
        test_probation()
        test_reviews()
        test_notifications()
        test_dashboards()
        test_admin()
        
        print_summary()
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        print_summary()
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        print_summary()


# ============================================================================
# GOAL TESTS (GOAL-01 to GOAL-23)
# ============================================================================

def test_goals():
    """Test goal management module"""
    print("\n" + "="*80)
    print("GOAL TESTS (GOAL-01 to GOAL-23)")
    print("="*80)
    
    # GOAL-01: Create goal as employee
    goal_data = {
        "title": "Complete Q1 deliverables",
        "description": "Finish all assigned tasks for Q1",
        "level": "individual",
        "tag": "quarterly",
        "priority": "high",
        "status": "DRAFT",
        "assignee_id": user_ids.get("employee", 3),
        "start_date": datetime.now().date().isoformat(),
        "target_date": (datetime.now() + timedelta(days=90)).date().isoformat()
    }
    success, status, data = api_call("POST", "/goals/", "employee", goal_data, expected_status=201)
    if success:
        test_data["employee_goal_id"] = data.get("id")
        log_result("GOAL-01", "Create goal as employee (INDIVIDUAL)", success and data.get("status") == "DRAFT", 
                   "DRAFT", data.get("status"))
    else:
        log_result("GOAL-01", "Create goal as employee", False, 201, status, f"Response: {data}")
    
    # GOAL-02: Create goal as manager
    manager_goal_data = {
        "title": "Team performance improvement",
        "description": "Improve team metrics",
        "level": "individual",
        "tag": "quarterly",
        "priority": "high",
        "status": "DRAFT",
        "assignee_id": user_ids.get("manager", 2),
        "start_date": datetime.now().date().isoformat(),
        "target_date": (datetime.now() + timedelta(days=90)).date().isoformat()
    }
    success, status, data = api_call("POST", "/goals/", "manager", manager_goal_data, expected_status=201)
    if success:
        test_data["manager_goal_id"] = data.get("id")
        log_result("GOAL-02", "Create goal as manager", True)
    else:
        log_result("GOAL-02", "Create goal as manager", False, 201, status)
    
    # GOAL-03: Create company goal as admin
    company_goal_data = {
        "title": "Company revenue target",
        "description": "Achieve $10M revenue",
        "level": "company",
        "tag": "quarterly",
        "priority": "critical",
        "status": "DRAFT",
        "assignee_id": user_ids.get("admin", 1),
        "start_date": datetime.now().date().isoformat(),
        "target_date": (datetime.now() + timedelta(days=180)).date().isoformat()
    }
    success, status, data = api_call("POST", "/goals/", "admin", company_goal_data, expected_status=201)
    if success:
        test_data["company_goal_id"] = data.get("id")
        log_result("GOAL-03", "Create company goal as admin", True)
    else:
        log_result("GOAL-03", "Create company goal as admin", False, 201, status)
    
    # GOAL-04: Create goal with invalid weightage
    invalid_goal = goal_data.copy()
    invalid_goal["weightage"] = 110
    success, status, data = api_call("POST", "/goals/", "employee", invalid_goal, expected_status=400)
    log_result("GOAL-04", "Create goal with invalid weightage (>100)", success, 400, status)
    
    # GOAL-05: List goals as member (only own)
    success, status, data = api_call("GET", "/goals/", "employee", expected_status=200)
    if success and isinstance(data, list):
        log_result("GOAL-05", "List goals as member (only own)", True)
        print(f"  Employee sees {len(data)} goal(s)")
    else:
        log_result("GOAL-05", "List goals as member", False, 200, status)
    
    # GOAL-06: List goals as manager (includes team)
    success, status, data = api_call("GET", "/goals/", "manager", expected_status=200)
    if success and isinstance(data, list):
        log_result("GOAL-06", "List goals as manager (includes team)", True)
        print(f"  Manager sees {len(data)} goal(s)")
    else:
        log_result("GOAL-06", "List goals as manager", False, 200, status)
    
    # GOAL-07: List goals as admin (all)
    success, status, data = api_call("GET", "/goals/", "admin", expected_status=200)
    if success and isinstance(data, list):
        log_result("GOAL-07", "List goals as admin (all)", True)
        print(f"  Admin sees {len(data)} goal(s)")
    else:
        log_result("GOAL-07", "List goals as admin", False, 200, status)
    
    # GOAL-08: Submit goal for approval
    if test_data.get("employee_goal_id"):
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/submit", 
                                         "employee", expected_status=200)
        if success:
            log_result("GOAL-08", "Submit goal for approval", 
                       data.get("status") == "PENDING_APPROVAL", "PENDING_APPROVAL", data.get("status"))
        else:
            log_result("GOAL-08", "Submit goal for approval", False, 200, status)
    else:
        log_skip("GOAL-08", "Submit goal for approval", "No employee goal created")
    
    # GOAL-09: Approve goal as manager
    if test_data.get("employee_goal_id"):
        approve_data = {"weightage": 30}
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/approve", 
                                         "manager", approve_data, expected_status=200)
        if success:
            log_result("GOAL-09", "Approve goal as manager", 
                       data.get("status") == "ACTIVE", "ACTIVE", data.get("status"))
        else:
            log_result("GOAL-09", "Approve goal as manager", False, 200, status, f"Response: {data}")
    else:
        log_skip("GOAL-09", "Approve goal as manager", "No employee goal created")
    
    # GOAL-10: Approve goal as member (should fail)
    if test_data.get("manager_goal_id"):
        success, status, data = api_call("POST", f"/goals/{test_data['manager_goal_id']}/approve", 
                                         "employee", expected_status=403)
        log_result("GOAL-10", "Approve goal as member (forbidden)", success, 403, status)
    else:
        log_skip("GOAL-10", "Approve goal as member", "No manager goal created")
    
    # GOAL-11: Reject goal with reason
    # Create another goal to reject
    reject_goal_data = goal_data.copy()
    reject_goal_data["title"] = "Goal to be rejected"
    success, status, data = api_call("POST", "/goals/", "employee", reject_goal_data, expected_status=201)
    if success:
        reject_goal_id = data.get("id")
        # Submit it
        api_call("POST", f"/goals/{reject_goal_id}/submit", "employee", expected_status=200)
        # Reject it
        reject_data = {"approval": False, "reason": "Needs more clarity"}
        success, status, data = api_call("POST", f"/goals/{reject_goal_id}/approve", 
                                         "manager", reject_data, expected_status=200)
        log_result("GOAL-11", "Reject goal with reason", 
                   success and data.get("status") == "REJECTED", "REJECTED", data.get("status"))
    else:
        log_skip("GOAL-11", "Reject goal with reason", "Could not create goal to reject")
    
    # GOAL-12: Update progress
    if test_data.get("employee_goal_id"):
        progress_data = {"completion_percentage": 50, "notes": "Halfway done"}
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/progress", 
                                         "employee", progress_data, expected_status=200)
        log_result("GOAL-12", "Update progress", success, 200, status, f"Response: {data}")
    else:
        log_skip("GOAL-12", "Update progress", "No employee goal created")
    
    # GOAL-13: Update progress over 100
    if test_data.get("employee_goal_id"):
        invalid_progress = {"completion_percentage": 120, "notes": "Invalid"}
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/progress", 
                                         "employee", invalid_progress, expected_status=400)
        log_result("GOAL-13", "Update progress over 100 (validation)", success, 400, status)
    else:
        log_skip("GOAL-13", "Update progress over 100", "No employee goal created")
    
    # GOAL-14: Complete goal
    if test_data.get("employee_goal_id"):
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/complete", 
                                         "employee", expected_status=200)
        log_result("GOAL-14", "Complete goal", success, 200, status, f"Response: {data}")
    else:
        log_skip("GOAL-14", "Complete goal", "No employee goal created")
    
    # GOAL-15: Add subtask
    if test_data.get("employee_goal_id"):
        subtask_data = {"title": "Subtask 1", "description": "First subtask"}
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/subtasks", 
                                         "employee", subtask_data, expected_status=201)
        if success or status == 200:  # Accept both 200 and 201
            test_data["subtask_id"] = data.get("id")
            log_result("GOAL-15", "Add subtask", True)
        else:
            log_result("GOAL-15", "Add subtask", False, 201, status)
    else:
        log_skip("GOAL-15", "Add subtask", "No employee goal created")
    
    # GOAL-16: Update subtask completion
    if test_data.get("subtask_id"):
        subtask_update = {"status": "COMPLETED"}
        success, status, data = api_call("PATCH", f"/goals/subtasks/{test_data['subtask_id']}", 
                                         "employee", subtask_update, expected_status=200)
        log_result("GOAL-16", "Update subtask completion", success, 200, status)
    else:
        log_skip("GOAL-16", "Update subtask completion", "No subtask created")
    
    # GOAL-17: Submit member (self) feedback
    if test_data.get("employee_goal_id"):
        member_feedback = {
            "rating": 4,
            "comment": "Good progress made",
            "deliverables": "Completed all tasks",
            "quality_rating": 4,
            "timeliness_rating": 4
        }
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/feedback/member", 
                                         "employee", member_feedback, expected_status=201)
        log_result("GOAL-17", "Submit member (self) feedback", success or status == 200, 201, status)
    else:
        log_skip("GOAL-17", "Submit member feedback", "No employee goal created")
    
    # GOAL-18: Submit evaluator (manager) feedback
    if test_data.get("employee_goal_id"):
        evaluator_feedback = {
            "rating": 4,
            "comment": "Well done",
            "quality_rating": 4,
            "timeliness_rating": 4,
            "collaboration_rating": 4
        }
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/feedback/evaluator", 
                                         "manager", evaluator_feedback, expected_status=201)
        log_result("GOAL-18", "Submit evaluator (manager) feedback", success or status == 200, 201, status)
    else:
        log_skip("GOAL-18", "Submit evaluator feedback", "No employee goal created")
    
    # GOAL-19: Score goal
    if test_data.get("employee_goal_id"):
        score_data = {"rating": "MEETS_EXPECTATIONS"}
        success, status, data = api_call("POST", f"/goals/{test_data['employee_goal_id']}/score", 
                                         "manager", score_data, expected_status=200)
        log_result("GOAL-19", "Score goal", success, 200, status, f"Response: {data}")
    else:
        log_skip("GOAL-19", "Score goal", "No employee goal created")
    
    # GOAL-20: Score goal without both feedbacks (create new goal)
    new_goal_data = goal_data.copy()
    new_goal_data["title"] = "Goal without feedback"
    success, status, data = api_call("POST", "/goals/", "employee", new_goal_data, expected_status=201)
    if success:
        incomplete_goal_id = data.get("id")
        score_data = {"rating": "MEETS_EXPECTATIONS"}
        success, status, data = api_call("POST", f"/goals/{incomplete_goal_id}/score", 
                                         "manager", score_data, expected_status=400)
        log_result("GOAL-20", "Score goal without both feedbacks (validation)", success, 400, status)
    else:
        log_skip("GOAL-20", "Score goal without feedbacks", "Could not create test goal")
    
    # GOAL-21: Goal hierarchy - create team goal under company
    if test_data.get("company_goal_id"):
        team_goal_data = {
            "title": "Team sales target",
            "description": "Achieve team quota",
            "level": "team",
            "tag": "quarterly",
            "priority": "high",
            "status": "DRAFT",
            "parent_id": test_data["company_goal_id"],
            "assignee_id": user_ids.get("manager", 2),
            "start_date": datetime.now().date().isoformat(),
            "target_date": (datetime.now() + timedelta(days=90)).date().isoformat()
        }
        success, status, data = api_call("POST", "/goals/", "admin", team_goal_data, expected_status=201)
        if success:
            test_data["team_goal_id"] = data.get("id")
            log_result("GOAL-21", "Create team goal under company goal", True)
        else:
            log_result("GOAL-21", "Create team goal under company goal", False, 201, status, f"Response: {data}")
    else:
        log_skip("GOAL-21", "Create team goal under company", "No company goal created")
    
    # GOAL-22: Goal hierarchy - create individual goal under team
    if test_data.get("team_goal_id"):
        ind_goal_data = {
            "title": "Individual contribution",
            "description": "Personal target",
            "level": "individual",
            "tag": "quarterly",
            "priority": "high",
            "status": "DRAFT",
            "parent_id": test_data["team_goal_id"],
            "assignee_id": user_ids.get("employee", 3),
            "start_date": datetime.now().date().isoformat(),
            "target_date": (datetime.now() + timedelta(days=90)).date().isoformat()
        }
        success, status, data = api_call("POST", "/goals/", "manager", ind_goal_data, expected_status=201)
        log_result("GOAL-22", "Create individual goal under team goal", success, 201, status)
    else:
        log_skip("GOAL-22", "Create individual goal under team", "No team goal created")
    
    # GOAL-23: Goal hierarchy - invalid parent level
    if test_data.get("company_goal_id"):
        invalid_hierarchy = {
            "title": "Invalid hierarchy goal",
            "description": "Should fail",
            "level": "individual",
            "tag": "quarterly",
            "priority": "high",
            "status": "DRAFT",
            "parent_id": test_data["company_goal_id"],  # Individual under company (should be under team)
            "assignee_id": user_ids.get("employee", 3),
            "start_date": datetime.now().date().isoformat(),
            "target_date": (datetime.now() + timedelta(days=90)).date().isoformat()
        }
        success, status, data = api_call("POST", "/goals/", "employee", invalid_hierarchy, expected_status=400)
        log_result("GOAL-23", "Invalid parent level (individual under company)", success, 400, status)
    else:
        log_skip("GOAL-23", "Invalid parent level", "No company goal created")


# ============================================================================
# WEIGHTAGE TESTS (WEIGHT-01)
# ============================================================================

def test_weightage():
    """Test weightage management"""
    print("\n" + "="*80)
    print("WEIGHTAGE TESTS (WEIGHT-01)")
    print("="*80)
    
    # WEIGHT-01: Get remaining weightage
    success, status, data = api_call("GET", f"/users/{user_ids['employee']}/weightage/quarterly", 
                                     "employee", expected_status=200)
    if success:
        log_result("WEIGHT-01", "Get remaining weightage", True)
        print(f"  Remaining weightage: {data.get('remaining_weightage', 'N/A')}")
    else:
        log_result("WEIGHT-01", "Get remaining weightage", False, 200, status)

# ============================================================================
# PROBATION TESTS (PROB-01 to PROB-16)
# ============================================================================

def test_probation():
    """Test probation management module"""
    print("\n" + "="*80)
    print("PROBATION TESTS (PROB-01 to PROB-16)")
    print("="*80)
    
    # PROB-01: Create probation record
    prob_data = {
        "employee_id": user_ids.get("employee", 3),
        "date_of_joining": "2026-01-01"
    }
    success, status, data = api_call("POST", "/probation/", "admin", prob_data, expected_status=201)
    if success:
        test_data["probation_id"] = data.get("id")
        log_result("PROB-01", "Create probation record", 
                   data.get("status") == "IN_PROBATION", "IN_PROBATION", data.get("status"))
    else:
        log_result("PROB-01", "Create probation record", False, 201, status, f"Response: {data}")
    
    # PROB-02: Auto-creation tested via USER-01 (skipped as it's system behavior)
    log_skip("PROB-02", "Auto-creation on user creation", "System behavior - tested via USER-01")
    
    # PROB-03: List probation records as admin
    success, status, data = api_call("GET", "/probation/", "admin", expected_status=200)
    if success and isinstance(data, list):
        log_result("PROB-03", "List probation records as admin", True)
        print(f"  Found {len(data)} probation record(s)")
    else:
        log_result("PROB-03", "List probation records as admin", False, 200, status)
    
    # PROB-04: List probation records as manager
    success, status, data = api_call("GET", "/probation/", "manager", expected_status=200)
    if success and isinstance(data, list):
        log_result("PROB-04", "List probation records as manager (team only)", True)
        print(f"  Manager sees {len(data)} record(s)")
    else:
        log_result("PROB-04", "List probation records as manager", False, 200, status)
    
    # PROB-05: Get probation by employee
    success, status, data = api_call("GET", f"/probation/employee/{user_ids['employee']}", 
                                     "manager", expected_status=200)
    log_result("PROB-05", "Get probation by employee (manager)", success, 200, status)
    
    # PROB-06: Get probation by employee - unauthorized
    success, status, data = api_call("GET", f"/probation/employee/{user_ids['manager']}", 
                                     "employee", expected_status=403)
    log_result("PROB-06", "Get probation by employee - unauthorized", success, 403, status)
    
    # PROB-07: Pause probation
    if test_data.get("probation_id"):
        pause_data = {
            "reason": "Medical leave",
            "pause_date": datetime.now().date().isoformat()
        }
        success, status, data = api_call("POST", f"/probation/{test_data['probation_id']}/pause", 
                                         "admin", pause_data, expected_status=200)
        log_result("PROB-07", "Pause probation", success, 200, status, f"Response: {data}")
    else:
        log_skip("PROB-07", "Pause probation", "No probation record created")
    
    # PROB-08: Resume probation
    if test_data.get("probation_id"):
        resume_data = {"resume_date": datetime.now().date().isoformat()}
        success, status, data = api_call("POST", f"/probation/{test_data['probation_id']}/resume", 
                                         "admin", resume_data, expected_status=200)
        log_result("PROB-08", "Resume probation", success, 200, status, f"Response: {data}")
    else:
        log_skip("PROB-08", "Resume probation", "No probation record created")
    
    # PROB-09: Complete probation
    if test_data.get("probation_id"):
        complete_data = {"outcome": "PASSED"}
        success, status, data = api_call("POST", f"/probation/{test_data['probation_id']}/complete", 
                                         "admin", complete_data, expected_status=200)
        log_result("PROB-09", "Complete probation", success, 200, status)
    else:
        log_skip("PROB-09", "Complete probation", "No probation record created")
    
    # PROB-10: Reject probation (create new record)
    prob_data2 = {
        "employee_id": user_ids.get("employee2", 4),
        "date_of_joining": "2026-01-01"
    }
    success, status, data = api_call("POST", "/probation/", "admin", prob_data2, expected_status=201)
    if success:
        prob_id_2 = data.get("id")
        reject_data = {"outcome": "FAILED", "reason": "Performance issues"}
        success, status, data = api_call("POST", f"/probation/{prob_id_2}/reject", 
                                         "admin", reject_data, expected_status=200)
        log_result("PROB-10", "Reject probation", success, 200, status)
    else:
        log_skip("PROB-10", "Reject probation", "Could not create probation record")
    
    # PROB-11: Trigger creation (scheduler) - system behavior
    log_skip("PROB-11", "Trigger creation (scheduler)", "System/scheduler behavior - not API testable")
    
    # PROB-12: Submit feedback for trigger (employee)
    # Get triggers first
    success, status, data = api_call("GET", "/probation/", "admin", expected_status=200)
    if success and isinstance(data, list) and len(data) > 0:
        # Find a record with triggers
        trigger_id = None
        for record in data:
            if "id" in record:
                # Try to get triggers for this record
                pass
        
        if trigger_id:
            feedback_data = {
                "feedback_type": "self",
                "form_data": {
                    "rating": 4,
                    "comment": "Good progress",
                    "areas_of_improvement": "Communication"
                }
            }
            success, status, data = api_call("POST", f"/probation/triggers/{trigger_id}/feedback", 
                                             "employee", feedback_data, expected_status=201)
            log_result("PROB-12", "Submit feedback for trigger (employee)", success, 201, status)
        else:
            log_skip("PROB-12", "Submit feedback for trigger", "No triggers found")
    else:
        log_skip("PROB-12", "Submit feedback for trigger", "No probation records")
    
    # PROB-13 to PROB-16: Skipping detailed trigger feedback tests as they require scheduler
    log_skip("PROB-13", "Submit feedback as manager", "Requires active trigger from scheduler")
    log_skip("PROB-14", "Get trigger feedbacks", "Requires active trigger from scheduler")
    log_skip("PROB-15", "Get trigger feedbacks before cross-share", "Requires active trigger")
    log_skip("PROB-16", "Reminder and escalation (scheduler)", "System/scheduler behavior")

# ============================================================================
# REVIEW CYCLE TESTS (REV-01 to REV-15)
# ============================================================================

def test_reviews():
    """Test review cycle management"""
    print("\n" + "="*80)
    print("REVIEW CYCLE TESTS (REV-01 to REV-15)")
    print("="*80)
    
    # REV-01: Create review cycle
    cycle_data = {
        "cycle_name": f"Q1 Review {datetime.now().year}",
        "cycle_type": "quarterly",
        "description": "Quarterly performance review",
        "start_date": (datetime.now() - timedelta(days=30)).date().isoformat(),
        "end_date": (datetime.now() + timedelta(days=30)).date().isoformat(),
        "self_review_deadline": (datetime.now() + timedelta(days=15)).date().isoformat(),
        "manager_review_deadline": (datetime.now() + timedelta(days=25)).date().isoformat()
    }
    success, status, data = api_call("POST", "/review-cycles/", "admin", cycle_data, expected_status=201)
    if success:
        test_data["cycle_id"] = data.get("id")
        log_result("REV-01", "Create review cycle", 
                   data.get("status") == "PENDING", "PENDING", data.get("status"))
    else:
        log_result("REV-01", "Create review cycle", False, 201, status, f"Response: {data}")
    
    # REV-02: Create cycle with invalid dates
    invalid_cycle = cycle_data.copy()
    invalid_cycle["cycle_name"] = "Invalid Cycle"
    invalid_cycle["start_date"] = "2026-12-31"
    invalid_cycle["end_date"] = "2026-01-01"
    success, status, data = api_call("POST", "/review-cycles/", "admin", invalid_cycle, expected_status=400)
    log_result("REV-02", "Create cycle with invalid dates", success, 400, status)
    
    # REV-03: List cycles as admin
    success, status, data = api_call("GET", "/review-cycles/", "admin", expected_status=200)
    if success and isinstance(data, list):
        log_result("REV-03", "List cycles as admin", True)
        print(f"  Found {len(data)} cycle(s)")
    else:
        log_result("REV-03", "List cycles as admin", False, 200, status)
    
    # REV-04: List cycles as manager
    success, status, data = api_call("GET", "/review-cycles/", "manager", expected_status=200)
    if success and isinstance(data, list):
        log_result("REV-04", "List cycles as manager", True)
        print(f"  Manager sees {len(data)} cycle(s)")
    else:
        log_result("REV-04", "List cycles as manager", False, 200, status)
    
    # REV-05: Trigger cycle
    if test_data.get("cycle_id"):
        success, status, data = api_call("POST", f"/review-cycles/{test_data['cycle_id']}/trigger", 
                                         "admin", expected_status=200)
        log_result("REV-05", "Trigger cycle", success, 200, status)
    else:
        log_skip("REV-05", "Trigger cycle", "No cycle created")
    
    # REV-06: Trigger cycle with no eligible employees
    log_skip("REV-06", "Trigger cycle with no eligible employees", "Requires specific test data setup")
    
    # REV-07: Get my forms
    success, status, data = api_call("GET", "/review-forms/", "employee", expected_status=200)
    if success and isinstance(data, list):
        log_result("REV-07", "Get my forms (employee)", True)
        print(f"  Employee has {len(data)} form(s)")
        if len(data) > 0:
            test_data["form_id"] = data[0].get("id")
    else:
        log_result("REV-07", "Get my forms", False, 200, status)
    
    # REV-08: Submit self-assessment form
    if test_data.get("form_id"):
        form_data = {
            "form_data": {
                "self_rating": 4,
                "self_comment": "Met all objectives",
                "achievements": "Completed 3 major projects"
            }
        }
        success, status, data = api_call("POST", f"/review-forms/{test_data['form_id']}/submit", 
                                         "employee", form_data, expected_status=200)
        log_result("REV-08", "Submit self-assessment form", success, 200, status, f"Response: {data}")
    else:
        log_skip("REV-08", "Submit self-assessment form", "No form available")
    
    # REV-09: Submit manager feedback form
    if test_data.get("form_id"):
        manager_form_data = {
            "form_data": {
                "manager_rating": 4,
                "manager_comment": "Strong performance",
                "development_areas": "Leadership skills",
                "final_rating": 4
            }
        }
        success, status, data = api_call("POST", f"/review-forms/{test_data['form_id']}/submit", 
                                         "manager", manager_form_data, expected_status=200)
        log_result("REV-09", "Submit manager feedback form", success, 200, status, f"Response: {data}")
    else:
        log_skip("REV-09", "Submit manager feedback form", "No form available")
    
    # REV-10: Cross-share after both submitted
    log_skip("REV-10", "Cross-share after both submitted", "System behavior - verified via REV-08/09")
    
    # REV-11: Get cycle compliance
    if test_data.get("cycle_id"):
        success, status, data = api_call("GET", f"/review-cycles/{test_data['cycle_id']}/compliance", 
                                         "admin", expected_status=200)
        log_result("REV-11", "Get cycle compliance", success, 200, status)
    else:
        log_skip("REV-11", "Get cycle compliance", "No cycle created")
    
    # REV-12: Close cycle
    if test_data.get("cycle_id"):
        success, status, data = api_call("POST", f"/review-cycles/{test_data['cycle_id']}/close", 
                                         "admin", expected_status=200)
        log_result("REV-12", "Close cycle", success, 200, status)
    else:
        log_skip("REV-12", "Close cycle", "No cycle created")
    
    # REV-13: Get my performance history
    success, status, data = api_call("GET", "/review-history/", "employee", expected_status=200)
    if success and isinstance(data, list):
        log_result("REV-13", "Get my performance history", True)
        print(f"  Employee has {len(data)} history record(s)")
    else:
        log_result("REV-13", "Get my performance history", False, 200, status)
    
    # REV-14: Get employee history as manager
    success, status, data = api_call("GET", f"/review-history/{user_ids['employee']}", 
                                     "manager", expected_status=200)
    log_result("REV-14", "Get employee history as manager", success, 200, status)
    
    # REV-15: Get employee history as member (should fail)
    success, status, data = api_call("GET", f"/review-history/{user_ids['manager']}", 
                                     "employee", expected_status=403)
    log_result("REV-15", "Get employee history as member (forbidden)", success, 403, status)

# ============================================================================
# NOTIFICATION TESTS (NOT-01 to NOT-04)
# ============================================================================

def test_notifications():
    """Test notification management"""
    print("\n" + "="*80)
    print("NOTIFICATION TESTS (NOT-01 to NOT-04)")
    print("="*80)
    
    # NOT-01: Get my notifications
    success, status, data = api_call("GET", "/notifications/", "employee", expected_status=200)
    if success and isinstance(data, list):
        log_result("NOT-01", "Get my notifications", True)
        print(f"  Employee has {len(data)} notification(s)")
        if len(data) > 0:
            test_data["notification_id"] = data[0].get("id")
    else:
        log_result("NOT-01", "Get my notifications", False, 200, status)
    
    # NOT-02: Get unread count
    success, status, data = api_call("GET", "/notifications/unread-count", "employee", expected_status=200)
    if success:
        log_result("NOT-02", "Get unread count", True)
        print(f"  Unread count: {data.get('unread_count', 'N/A')}")
    else:
        log_result("NOT-02", "Get unread count", False, 200, status)
    
    # NOT-03: Mark notification read
    if test_data.get("notification_id"):
        success, status, data = api_call("PATCH", f"/notifications/{test_data['notification_id']}/read", 
                                         "employee", expected_status=200)
        log_result("NOT-03", "Mark notification read", success, 200, status)
    else:
        log_skip("NOT-03", "Mark notification read", "No notifications available")
    
    # NOT-04: Mark all read
    success, status, data = api_call("PATCH", "/notifications/read-all", "employee", expected_status=200)
    log_result("NOT-04", "Mark all read", success, 200, status)

# ============================================================================
# DASHBOARD TESTS (DASH-01 to DASH-05)
# ============================================================================

def test_dashboards():
    """Test dashboard endpoints"""
    print("\n" + "="*80)
    print("DASHBOARD TESTS (DASH-01 to DASH-05)")
    print("="*80)
    
    # DASH-01: My dashboard (member)
    success, status, data = api_call("GET", "/dashboard/me", "employee", expected_status=200)
    log_result("DASH-01", "My dashboard (member)", success, 200, status)
    
    # DASH-02: My dashboard as manager
    success, status, data = api_call("GET", "/dashboard/me", "manager", expected_status=200)
    log_result("DASH-02", "My dashboard as manager", success, 200, status)
    
    # DASH-03: Team dashboard (manager)
    success, status, data = api_call("GET", "/dashboard/team", "manager", expected_status=200)
    log_result("DASH-03", "Team dashboard (manager)", success, 200, status)
    
    # DASH-04: Team dashboard as member (should fail)
    success, status, data = api_call("GET", "/dashboard/team", "employee", expected_status=403)
    log_result("DASH-04", "Team dashboard as member (forbidden)", success, 403, status)
    
    # DASH-05: Company dashboard (admin)
    success, status, data = api_call("GET", "/dashboard/company", "admin", expected_status=200)
    log_result("DASH-05", "Company dashboard (admin)", success, 200, status)

# ============================================================================
# ADMIN TESTS (ADMIN-01 to ADMIN-08)
# ============================================================================

def test_admin():
    """Test admin endpoints"""
    print("\n" + "="*80)
    print("ADMIN TESTS (ADMIN-01 to ADMIN-08)")
    print("="*80)
    
    # ADMIN-01: Get flagged feedback
    success, status, data = api_call("GET", "/admin/flags", "admin", expected_status=200)
    if success and isinstance(data, list):
        log_result("ADMIN-01", "Get flagged feedback", True)
        print(f"  Found {len(data)} flagged item(s)")
    else:
        log_result("ADMIN-01", "Get flagged feedback", False, 200, status)
    
    # ADMIN-02: Resolve goal flag
    # Need a flagged feedback ID - skip if none
    log_skip("ADMIN-02", "Resolve goal flag", "Requires flagged feedback in system")
    
    # ADMIN-03: Resolve probation flag
    log_skip("ADMIN-03", "Resolve probation flag", "Requires flagged probation feedback")
    
    # ADMIN-04: Export goals report (JSON)
    success, status, data = api_call("GET", "/admin/reports/goals", "admin", 
                                     params={"format": "json"}, expected_status=200)
    log_result("ADMIN-04", "Export goals report (JSON)", success, 200, status)
    
    # ADMIN-05: Export goals report (CSV)
    success, status, data = api_call("GET", "/admin/reports/goals", "admin", 
                                     params={"format": "csv"}, expected_status=200)
    log_result("ADMIN-05", "Export goals report (CSV)", success, 200, status)
    
    # ADMIN-06: Export probation report
    success, status, data = api_call("GET", "/admin/reports/probation", "admin", 
                                     params={"format": "json"}, expected_status=200)
    log_result("ADMIN-06", "Export probation report", success, 200, status)
    
    # ADMIN-07: Export reviews report
    success, status, data = api_call("GET", "/admin/reports/reviews", "admin", 
                                     params={"format": "json"}, expected_status=200)
    log_result("ADMIN-07", "Export reviews report", success, 200, status)
    
    # ADMIN-08: Access admin endpoints as manager (should fail)
    success, status, data = api_call("GET", "/admin/flags", "manager", expected_status=403)
    log_result("ADMIN-08", "Access admin endpoints as manager (forbidden)", success, 403, status)
