#!/usr/bin/env python3
"""
PMS Backend - AUTH Test Cases (AUTH-01 to AUTH-04)
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8003/api/v1"

# Test users
ADMIN = {"email": "sandeep@opstree.com", "password": "test"}
MANAGER = {"email": "deepak@opstree.com", "password": "test"}
EMPLOYEE = {"email": "harshit@opstree.com", "password": "test"}

results = {"passed": 0, "failed": 0, "total": 0, "errors": []}
tokens = {}

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
print("PMS BACKEND - AUTH TEST CASES (AUTH-01 to AUTH-04)")
print("="*80)
print(f"Test ID | Scenario | Status")
print("-"*80)

# ============================================================================
# AUTH-01: Standard valid login
# ============================================================================
try:
    resp = requests.post(f"{BASE_URL}/auth/login", json=ADMIN)
    
    if resp.status_code == 200:
        data = resp.json()
        if "access_token" in data and data["access_token"]:
            tokens["admin"] = data["access_token"]
            test_result("AUTH-01", "Standard valid login (Admin)", True, 
                       "200 + JWT token", f"200 + token received")
        else:
            test_result("AUTH-01", "Standard valid login (Admin)", False,
                       "200 + JWT token", f"200 but no token in response")
    else:
        test_result("AUTH-01", "Standard valid login (Admin)", False,
                   "200", resp.status_code, resp.text[:100])
except Exception as e:
    test_result("AUTH-01", "Standard valid login (Admin)", False,
               "200", "Exception", str(e))

# Test with Manager
try:
    resp = requests.post(f"{BASE_URL}/auth/login", json=MANAGER)
    
    if resp.status_code == 200:
        data = resp.json()
        if "access_token" in data and data["access_token"]:
            tokens["manager"] = data["access_token"]
            test_result("AUTH-01", "Standard valid login (Manager)", True,
                       "200 + JWT token", f"200 + token received")
        else:
            test_result("AUTH-01", "Standard valid login (Manager)", False,
                       "200 + JWT token", f"200 but no token in response")
    else:
        test_result("AUTH-01", "Standard valid login (Manager)", False,
                   "200", resp.status_code)
except Exception as e:
    test_result("AUTH-01", "Standard valid login (Manager)", False,
               "200", "Exception", str(e))

# Test with Employee
try:
    resp = requests.post(f"{BASE_URL}/auth/login", json=EMPLOYEE)
    
    if resp.status_code == 200:
        data = resp.json()
        if "access_token" in data and data["access_token"]:
            tokens["employee"] = data["access_token"]
            test_result("AUTH-01", "Standard valid login (Employee)", True,
                       "200 + JWT token", f"200 + token received")
        else:
            test_result("AUTH-01", "Standard valid login (Employee)", False,
                       "200 + JWT token", f"200 but no token in response")
    else:
        test_result("AUTH-01", "Standard valid login (Employee)", False,
                   "200", resp.status_code)
except Exception as e:
    test_result("AUTH-01", "Standard valid login (Employee)", False,
               "200", "Exception", str(e))

# ============================================================================
# AUTH-02: Login with deactivated user account
# ============================================================================
# First, we need to create and deactivate a user (requires admin token)
deactivated_user_email = None

if tokens.get("admin"):
    try:
        # Create a test user
        new_user = {
            "email": f"deactivated_test_{datetime.now().timestamp()}@opstree.com",
            "name": "Deactivated Test User",
            "role": "member",
            "password": "test123",
            "manager_id": 2,
            "team_id": 1,
            "date_of_joining": "2026-01-01"
        }
        
        headers = {"Authorization": f"Bearer {tokens['admin']}"}
        resp = requests.post(f"{BASE_URL}/users/", json=new_user, headers=headers)
        
        if resp.status_code == 201:
            user_data = resp.json()
            user_id = user_data.get("id")
            deactivated_user_email = new_user["email"]
            
            # Deactivate the user (DELETE sets is_active=false)
            resp = requests.delete(f"{BASE_URL}/users/{user_id}", headers=headers)
            
            if resp.status_code == 204 or resp.status_code == 200:
                # Now try to login with deactivated user
                deactivated_creds = {
                    "email": deactivated_user_email,
                    "password": "test123"
                }
                
                resp = requests.post(f"{BASE_URL}/auth/login", json=deactivated_creds)
                
                # Should get 401 or 403
                if resp.status_code in [401, 403]:
                    test_result("AUTH-02", "Login with deactivated user account", True,
                               "401/403", resp.status_code)
                else:
                    test_result("AUTH-02", "Login with deactivated user account", False,
                               "401/403", resp.status_code, 
                               "Deactivated user should not be able to login")
            else:
                test_result("AUTH-02", "Login with deactivated user account", False,
                           "Test setup", f"Could not deactivate user: {resp.status_code}",
                           "Skipping test")
        else:
            test_result("AUTH-02", "Login with deactivated user account", False,
                       "Test setup", f"Could not create test user: {resp.status_code}",
                       "Skipping test")
    except Exception as e:
        test_result("AUTH-02", "Login with deactivated user account", False,
                   "401/403", "Exception", str(e))
else:
    test_result("AUTH-02", "Login with deactivated user account", False,
               "Test setup", "No admin token", "Cannot create test user")

# ============================================================================
# AUTH-03: Member attempts to create a new user
# ============================================================================
if tokens.get("employee"):
    try:
        new_user = {
            "email": f"unauthorized_test_{datetime.now().timestamp()}@opstree.com",
            "name": "Unauthorized Test User",
            "role": "member",
            "password": "test123",
            "manager_id": 2,
            "team_id": 1,
            "date_of_joining": "2026-01-01"
        }
        
        headers = {"Authorization": f"Bearer {tokens['employee']}"}
        resp = requests.post(f"{BASE_URL}/users/", json=new_user, headers=headers)
        
        # Should get 403 Forbidden
        if resp.status_code == 403:
            test_result("AUTH-03", "Member attempts to create a new user", True,
                       "403 Forbidden", resp.status_code)
        else:
            test_result("AUTH-03", "Member attempts to create a new user", False,
                       "403 Forbidden", resp.status_code,
                       "Member should not be able to create users")
    except Exception as e:
        test_result("AUTH-03", "Member attempts to create a new user", False,
                   "403", "Exception", str(e))
else:
    test_result("AUTH-03", "Member attempts to create a new user", False,
               "Test setup", "No employee token", "Cannot test")

# ============================================================================
# AUTH-04: Manager attempts to delete a team
# ============================================================================
if tokens.get("manager") and tokens.get("admin"):
    try:
        # First create a team as admin to delete
        team_data = {
            "name": f"Test Team for Deletion {datetime.now().timestamp()}",
            "description": "Team to test deletion permissions"
        }
        
        admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}
        resp = requests.post(f"{BASE_URL}/teams/", json=team_data, headers=admin_headers)
        
        if resp.status_code == 201:
            team_data = resp.json()
            team_id = team_data.get("id")
            
            # Now try to delete as manager
            manager_headers = {"Authorization": f"Bearer {tokens['manager']}"}
            resp = requests.delete(f"{BASE_URL}/teams/{team_id}", headers=manager_headers)
            
            # Should get 403 Forbidden
            if resp.status_code == 403:
                test_result("AUTH-04", "Manager attempts to delete a team", True,
                           "403 Forbidden", resp.status_code)
                
                # Clean up: delete the team as admin
                requests.delete(f"{BASE_URL}/teams/{team_id}", headers=admin_headers)
            else:
                test_result("AUTH-04", "Manager attempts to delete a team", False,
                           "403 Forbidden", resp.status_code,
                           "Manager should not be able to delete teams")
        else:
            test_result("AUTH-04", "Manager attempts to delete a team", False,
                       "Test setup", f"Could not create test team: {resp.status_code}",
                       "Skipping test")
    except Exception as e:
        test_result("AUTH-04", "Manager attempts to delete a team", False,
                   "403", "Exception", str(e))
else:
    test_result("AUTH-04", "Manager attempts to delete a team", False,
               "Test setup", "No manager/admin token", "Cannot test")

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
