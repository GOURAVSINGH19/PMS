#!/usr/bin/env python3
"""
Phase 1 Feature Testing Script
Tests all newly implemented features:
1. No manager alert & block
2. Manager change handling
3. Early termination
4. Review eligibility filter
5. Dual-track deduplication
6. Cross-share blind reveal
7. Red flag engine
8. Pattern detection
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8003/api/v1"

# Test credentials
ADMIN_EMAIL = "sandeep@opstree.com"
ADMIN_PASSWORD = "test"

def login(email, password):
    """Login and return token"""
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    print(f"❌ Login failed: {resp.text}")
    return None

def test_no_manager_alert(token):
    """Test 1: No Manager Alert & Block"""
    print("\n" + "="*60)
    print("TEST 1: No Manager Alert & Block")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create employee without manager
    user_data = {
        "email": f"test_no_mgr_{datetime.now().timestamp()}@example.com",
        "name": "Test No Manager",
        "role": "member",
        "password": "test123",
        "manager_id": None,  # No manager!
        "team_id": 1,
        "date_of_joining": (datetime.now() - timedelta(days=35)).strftime("%Y-%m-%d"),
        "is_active": True
    }
    
    resp = requests.post(f"{BASE_URL}/users/", json=user_data, headers=headers)
    if resp.status_code == 201:
        user = resp.json()
        print(f"✅ Created employee without manager: {user['email']}")
        print(f"   User ID: {user['id']}")
        print(f"   Expected: Scheduler will block trigger and alert admin")
        return user['id']
    else:
        print(f"❌ Failed to create user: {resp.text}")
        return None

def test_manager_change(token, employee_id):
    """Test 2: Manager Change Handling"""
    print("\n" + "="*60)
    print("TEST 2: Manager Change Handling")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get current manager
    resp = requests.get(f"{BASE_URL}/users/{employee_id}", headers=headers)
    if resp.status_code != 200:
        print(f"❌ Failed to get user: {resp.text}")
        return
    
    user = resp.json()
    old_manager = user.get("manager_id")
    
    # Change manager
    new_manager_id = 2 if old_manager != 2 else 5  # Switch between managers
    resp = requests.patch(
        f"{BASE_URL}/users/{employee_id}",
        json={"manager_id": new_manager_id},
        headers=headers
    )
    
    if resp.status_code == 200:
        print(f"✅ Changed manager from {old_manager} to {new_manager_id}")
        print(f"   Expected: New manager receives notification of pending triggers")
    else:
        print(f"❌ Failed to change manager: {resp.text}")

def test_early_termination(token, employee_id):
    """Test 3: Early Termination Handling"""
    print("\n" + "="*60)
    print("TEST 3: Early Termination Handling")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Deactivate employee
    resp = requests.patch(
        f"{BASE_URL}/users/{employee_id}",
        json={"is_active": False},
        headers=headers
    )
    
    if resp.status_code == 200:
        print(f"✅ Deactivated employee {employee_id}")
        print(f"   Expected: All probation triggers auto-cancelled")
    else:
        print(f"❌ Failed to deactivate: {resp.text}")

def test_review_eligibility(token):
    """Test 4: Review Eligibility Filter (>60 days)"""
    print("\n" + "="*60)
    print("TEST 4: Review Eligibility Filter")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create cycle
    today = datetime.now()
    cycle_data = {
        "cycle_name": f"Test Eligibility {today.timestamp()}",
        "cycle_type": "quarterly",
        "start_date": today.strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=90)).strftime("%Y-%m-%d"),
        "self_review_deadline": (today + timedelta(days=80)).strftime("%Y-%m-%d"),
        "manager_review_deadline": (today + timedelta(days=85)).strftime("%Y-%m-%d")
    }
    
    resp = requests.post(f"{BASE_URL}/review-cycles/", json=cycle_data, headers=headers)
    if resp.status_code != 201:
        print(f"❌ Failed to create cycle: {resp.text}")
        return None
    
    cycle = resp.json()
    print(f"✅ Created cycle: {cycle['cycle_name']}")
    
    # Trigger cycle
    resp = requests.post(f"{BASE_URL}/review-cycles/{cycle['id']}/trigger", headers=headers)
    if resp.status_code == 200:
        result = resp.json()
        print(f"✅ Triggered cycle")
        print(f"   Expected: Only employees joined >60 days before end date")
    else:
        print(f"❌ Failed to trigger: {resp.text}")
    
    return cycle['id']

def test_dual_track_deduplication(token):
    """Test 5: Dual-Track Deduplication"""
    print("\n" + "="*60)
    print("TEST 5: Dual-Track Deduplication")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    today = datetime.now()
    
    # Create quarterly cycle
    q_cycle = {
        "cycle_name": f"Q1 Test {today.timestamp()}",
        "cycle_type": "quarterly",
        "start_date": today.strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=90)).strftime("%Y-%m-%d"),
        "self_review_deadline": (today + timedelta(days=80)).strftime("%Y-%m-%d"),
        "manager_review_deadline": (today + timedelta(days=85)).strftime("%Y-%m-%d")
    }
    
    resp = requests.post(f"{BASE_URL}/review-cycles/", json=q_cycle, headers=headers)
    if resp.status_code != 201:
        print(f"❌ Failed to create quarterly: {resp.text}")
        return
    
    q_id = resp.json()['id']
    print(f"✅ Created quarterly cycle: {q_id}")
    
    # Trigger quarterly
    requests.post(f"{BASE_URL}/review-cycles/{q_id}/trigger", headers=headers)
    print(f"✅ Triggered quarterly cycle")
    
    # Create overlapping bi-annual
    ba_cycle = {
        "cycle_name": f"H1 Test {today.timestamp()}",
        "cycle_type": "bi_annual",
        "start_date": today.strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=180)).strftime("%Y-%m-%d"),
        "self_review_deadline": (today + timedelta(days=170)).strftime("%Y-%m-%d"),
        "manager_review_deadline": (today + timedelta(days=175)).strftime("%Y-%m-%d")
    }
    
    resp = requests.post(f"{BASE_URL}/review-cycles/", json=ba_cycle, headers=headers)
    if resp.status_code != 201:
        print(f"❌ Failed to create bi-annual: {resp.text}")
        return
    
    ba_id = resp.json()['id']
    print(f"✅ Created bi-annual cycle: {ba_id}")
    
    # Trigger bi-annual
    resp = requests.post(f"{BASE_URL}/review-cycles/{ba_id}/trigger", headers=headers)
    if resp.status_code == 200:
        print(f"✅ Triggered bi-annual cycle")
        print(f"   Expected: Employees in quarterly are skipped")
    else:
        print(f"❌ Failed to trigger: {resp.text}")

def test_red_flag_detection(token):
    """Test 7: Red Flag Engine"""
    print("\n" + "="*60)
    print("TEST 7: Red Flag Engine")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get a review form
    resp = requests.get(f"{BASE_URL}/review-forms/", headers=headers)
    if resp.status_code != 200 or not resp.json():
        print("⚠️  No review forms available for testing")
        return
    
    forms = resp.json()
    form = forms[0]
    
    # Submit with low rating
    submit_data = {
        "form_data": {
            "performance": "poor work quality",
            "achievements": "minimal",
            "challenges": "many issues"
        },
        "final_rating": 1  # Low rating!
    }
    
    resp = requests.post(
        f"{BASE_URL}/review-forms/{form['id']}/submit",
        json=submit_data,
        headers=headers
    )
    
    if resp.status_code == 200:
        result = resp.json()
        print(f"✅ Submitted form with low rating")
        print(f"   is_flagged: {result.get('is_flagged', 0)}")
        print(f"   flag_reason: {result.get('flag_reason', 'None')}")
        print(f"   Expected: is_flagged >= 2, admin notified")
    else:
        print(f"❌ Failed to submit: {resp.text}")

def main():
    print("\n" + "="*60)
    print("PMS PHASE 1 FEATURE TESTING")
    print("="*60)
    
    # Login
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    print(f"✅ Logged in as {ADMIN_EMAIL}")
    
    # Run tests
    employee_id = test_no_manager_alert(token)
    
    if employee_id:
        test_manager_change(token, employee_id)
        test_early_termination(token, employee_id)
    
    cycle_id = test_review_eligibility(token)
    test_dual_track_deduplication(token)
    test_red_flag_detection(token)
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print("="*60)
    print("\n📋 Summary:")
    print("1. ✅ No manager alert - Employee created without manager")
    print("2. ✅ Manager change - Manager reassigned")
    print("3. ✅ Early termination - Employee deactivated")
    print("4. ✅ Review eligibility - Cycle created with filter")
    print("5. ✅ Dual-track dedup - Overlapping cycles created")
    print("6. ⏳ Cross-share - Requires both forms submitted (manual test)")
    print("7. ✅ Red flag - Low rating submitted")
    print("8. ⏳ Pattern detection - Requires multiple cycles (manual test)")
    print("\n📧 Check email inboxes and admin dashboard for notifications!")
    print("🔍 Check backend logs: docker logs pms-gms-backend-1 --tail 50")

if __name__ == "__main__":
    main()
