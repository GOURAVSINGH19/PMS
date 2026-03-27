#!/usr/bin/env python3
"""
PMS Backend - ORG Test Cases (ORG-01 to ORG-04)
Organization/Team Management Tests
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8003/api/v1"

# Test users
ADMIN = {"email": "sandeep@opstree.com", "password": "test"}
MANAGER = {"email": "deepak@opstree.com", "password": "test"}

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
print("PMS BACKEND - ORG TEST CASES (ORG-01 to ORG-04)")
print("="*80)
print(f"Test ID | Scenario | Status")
print("-"*80)

# Login as admin and manager
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
    print("-"*80)
except Exception as e:
    print(f"✗ Login failed: {e}")
    exit(1)

# ============================================================================
# ORG-01: Create a new team
# ============================================================================
if tokens.get("admin"):
    try:
        team_data = {
            "name": f"Test Team ORG-01 {datetime.now().timestamp()}",
            "description": "Team created for ORG-01 test case"
        }
        
        headers = {"Authorization": f"Bearer {tokens['admin']}"}
        resp = requests.post(f"{BASE_URL}/teams/", json=team_data, headers=headers)
        
        if resp.status_code == 201:
            data = resp.json()
            if "id" in data and data["id"]:
                test_data["team_id"] = data["id"]
                test_result("ORG-01", "Create a new team", True,
                           "201 + Team ID", f"201 + Team ID: {data['id']}")
            else:
                test_result("ORG-01", "Create a new team", False,
                           "201 + Team ID", "201 but no ID in response")
        else:
            test_result("ORG-01", "Create a new team", False,
                       "201", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("ORG-01", "Create a new team", False,
                   "201", "Exception", str(e))
else:
    test_result("ORG-01", "Create a new team", False,
               "Test setup", "No admin token", "Cannot test")

# ============================================================================
# ORG-02: Create a user with a valid team_id and manager_id
# ============================================================================
if tokens.get("admin") and test_data.get("team_id") and test_data.get("manager_id"):
    try:
        user_data = {
            "email": f"org02_test_{datetime.now().timestamp()}@opstree.com",
            "name": "ORG-02 Test User",
            "role": "member",
            "password": "test123",
            "manager_id": test_data["manager_id"],
            "team_id": test_data["team_id"],
            "date_of_joining": "2026-01-01"
        }
        
        headers = {"Authorization": f"Bearer {tokens['admin']}"}
        resp = requests.post(f"{BASE_URL}/users/", json=user_data, headers=headers)
        
        if resp.status_code == 201:
            data = resp.json()
            if "id" in data and data["id"]:
                test_data["user_id"] = data["id"]
                # Verify team_id and manager_id are set correctly
                if data.get("team_id") == test_data["team_id"] and data.get("manager_id") == test_data["manager_id"]:
                    test_result("ORG-02", "Create user with valid team_id and manager_id", True,
                               "201 + User profile", f"201 + User ID: {data['id']}")
                else:
                    test_result("ORG-02", "Create user with valid team_id and manager_id", False,
                               "201 + correct team/manager", 
                               f"201 but team_id={data.get('team_id')}, manager_id={data.get('manager_id')}",
                               f"Expected team_id={test_data['team_id']}, manager_id={test_data['manager_id']}")
            else:
                test_result("ORG-02", "Create user with valid team_id and manager_id", False,
                           "201 + User ID", "201 but no ID in response")
        else:
            test_result("ORG-02", "Create user with valid team_id and manager_id", False,
                       "201", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("ORG-02", "Create user with valid team_id and manager_id", False,
                   "201", "Exception", str(e))
else:
    test_result("ORG-02", "Create user with valid team_id and manager_id", False,
               "Test setup", "Missing admin token, team_id, or manager_id", "Cannot test")

# ============================================================================
# ORG-03: Prevent deleting a team that currently has active users
# ============================================================================
if tokens.get("admin") and test_data.get("team_id") and test_data.get("user_id"):
    try:
        # The team created in ORG-01 now has a user (created in ORG-02)
        # Attempting to delete it should fail
        
        headers = {"Authorization": f"Bearer {tokens['admin']}"}
        resp = requests.delete(f"{BASE_URL}/teams/{test_data['team_id']}", headers=headers)
        
        # Should get 400 Bad Request (or possibly 409 Conflict)
        if resp.status_code in [400, 409]:
            test_result("ORG-03", "Prevent deleting team with active users", True,
                       "400 Bad Request", resp.status_code,
                       "Team with active users cannot be deleted")
        elif resp.status_code == 204 or resp.status_code == 200:
            test_result("ORG-03", "Prevent deleting team with active users", False,
                       "400 Bad Request", resp.status_code,
                       "Team was deleted despite having active users - SECURITY ISSUE")
        else:
            test_result("ORG-03", "Prevent deleting team with active users", False,
                       "400 Bad Request", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("ORG-03", "Prevent deleting team with active users", False,
                   "400", "Exception", str(e))
else:
    test_result("ORG-03", "Prevent deleting team with active users", False,
               "Test setup", "Missing team_id or user_id", "Cannot test")

# ============================================================================
# ORG-04: List users filtering by specific team_id
# ============================================================================
if tokens.get("manager") and test_data.get("team_id"):
    try:
        headers = {"Authorization": f"Bearer {tokens['manager']}"}
        params = {"team_id": test_data["team_id"]}
        resp = requests.get(f"{BASE_URL}/users/", headers=headers, params=params)
        
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                # Verify all returned users belong to the specified team
                all_correct_team = all(user.get("team_id") == test_data["team_id"] for user in data if "team_id" in user)
                
                if all_correct_team:
                    test_result("ORG-04", "List users filtering by specific team_id", True,
                               "200 + Team members only", 
                               f"200 + {len(data)} user(s) from team {test_data['team_id']}")
                else:
                    wrong_team_users = [u for u in data if u.get("team_id") != test_data["team_id"]]
                    test_result("ORG-04", "List users filtering by specific team_id", False,
                               "200 + Team members only",
                               f"200 but {len(wrong_team_users)} user(s) from different team(s)",
                               f"Filter not working correctly")
            else:
                test_result("ORG-04", "List users filtering by specific team_id", False,
                           "200 + list", f"200 but response is not a list: {type(data)}")
        else:
            test_result("ORG-04", "List users filtering by specific team_id", False,
                       "200", resp.status_code, resp.text[:200])
    except Exception as e:
        test_result("ORG-04", "List users filtering by specific team_id", False,
                   "200", "Exception", str(e))
else:
    test_result("ORG-04", "List users filtering by specific team_id", False,
               "Test setup", "Missing manager token or team_id", "Cannot test")

# ============================================================================
# CLEANUP
# ============================================================================
print("-"*80)
print("Cleaning up test data...")

if tokens.get("admin"):
    headers = {"Authorization": f"Bearer {tokens['admin']}"}
    
    # Delete test user first (to allow team deletion)
    if test_data.get("user_id"):
        try:
            resp = requests.delete(f"{BASE_URL}/users/{test_data['user_id']}", headers=headers)
            if resp.status_code in [200, 204]:
                print(f"✓ Deleted test user (ID: {test_data['user_id']})")
            else:
                print(f"⚠ Could not delete test user: {resp.status_code}")
        except Exception as e:
            print(f"⚠ Error deleting test user: {e}")
    
    # Now delete the team
    if test_data.get("team_id"):
        try:
            resp = requests.delete(f"{BASE_URL}/teams/{test_data['team_id']}", headers=headers)
            if resp.status_code in [200, 204]:
                print(f"✓ Deleted test team (ID: {test_data['team_id']})")
            else:
                print(f"⚠ Could not delete test team: {resp.status_code}")
        except Exception as e:
            print(f"⚠ Error deleting test team: {e}")

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
