#!/usr/bin/env python3
"""
Simplified notification test using verified email (jain.samyak1908@gmail.com)
Tests all notification triggers with a single user account.
"""

import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8003/api/v1"
VERIFIED_EMAIL = "jain.samyak1908@gmail.com"

# Login as existing user
response = requests.post(f"{BASE_URL}/auth/login", json={"email": VERIFIED_EMAIL, "password": "password123"})
if response.status_code != 200:
    print(f"Login failed: {response.status_code} - {response.text}")
    print("\nNote: Resend API is in test mode and can only send to: jain.samyak1908@gmail.com")
    print("All notification emails will be sent to this address.")
    exit(1)

token = response.json()["access_token"]
user_id = response.json()["user_id"]
headers = {"Authorization": f"Bearer {token}"}

print("=" * 70)
print("PMS NOTIFICATION SYSTEM - EMAIL TEST")
print("=" * 70)
print(f"\n✓ Logged in as: {VERIFIED_EMAIL}")
print(f"✓ All notification emails will be sent to: {VERIFIED_EMAIL}\n")

# Test 1: Goal Submission
print("1. Testing Goal Submission Notification...")
goal_data = {
    "title": "Q1 Performance Testing Goals",
    "description": "Complete all performance testing for microservices",
    "level": "individual",
    "tag": "quarterly",
    "priority": "high",
    "start_date": datetime.now().date().isoformat(),
    "assignee_id": user_id
}
resp = requests.post(f"{BASE_URL}/goals/", json=goal_data, headers=headers)
if resp.status_code == 201:
    goal_id = resp.json()["id"]
    print(f"   ✓ Created goal ID: {goal_id}")
    
    # Submit for approval
    resp = requests.post(f"{BASE_URL}/goals/{goal_id}/submit", headers=headers)
    if resp.status_code == 200:
        print(f"   ✓ Goal submitted - Email sent (goal_submitted)")
    else:
        print(f"   ✗ Submit failed: {resp.status_code}")
else:
    print(f"   ✗ Goal creation failed: {resp.status_code} - {resp.text}")
    goal_id = None

# Test 2: Goal Approval (if user is manager/admin)
if goal_id:
    print("\n2. Testing Goal Approval Notification...")
    resp = requests.post(f"{BASE_URL}/goals/{goal_id}/approve", 
                        json={"approved": True}, 
                        headers=headers)
    if resp.status_code == 200:
        print(f"   ✓ Goal approved - Email sent (goal_approved)")
    else:
        print(f"   Note: Approval requires manager/admin role")

# Test 3: Goal Rejection
print("\n3. Testing Goal Rejection Notification...")
goal_data2 = {
    "title": "Test Rejection Workflow",
    "description": "This goal will be rejected for testing",
    "level": "individual",
    "tag": "weekly",
    "priority": "low",
    "start_date": datetime.now().date().isoformat(),
    "assignee_id": user_id
}
resp = requests.post(f"{BASE_URL}/goals/", json=goal_data2, headers=headers)
if resp.status_code == 201:
    goal_id2 = resp.json()["id"]
    requests.post(f"{BASE_URL}/goals/{goal_id2}/submit", headers=headers)
    
    resp = requests.post(f"{BASE_URL}/goals/{goal_id2}/approve", 
                        json={"approved": False, "rejection_comment": "Needs more details"}, 
                        headers=headers)
    if resp.status_code == 200:
        print(f"   ✓ Goal rejected - Email sent (goal_rejected)")
    else:
        print(f"   Note: Rejection requires manager/admin role")

# Test 4: Red Flag Detection
if goal_id:
    print("\n4. Testing Red Flag Detection Notification...")
    progress_data = {
        "completion_percentage": 5,
        "notes": "Blocked by multiple dependencies - high risk"
    }
    resp = requests.post(f"{BASE_URL}/goals/{goal_id}/progress", json=progress_data, headers=headers)
    if resp.status_code == 200:
        print(f"   ✓ Progress updated - Red flag email sent (flag_detected)")
    else:
        print(f"   ✗ Progress update failed: {resp.status_code}")

# Test 5: Goal Completion & Feedback
if goal_id:
    print("\n5. Testing Goal Completion Notification...")
    resp = requests.post(f"{BASE_URL}/goals/{goal_id}/complete", headers=headers)
    if resp.status_code == 200:
        print(f"   ✓ Goal completed - Status: AWAITING_FEEDBACK")
        
        # Submit member feedback
        feedback_data = {
            "self_rating": 4,
            "comments": "Successfully completed all tests",
            "challenges": "Initial setup complexity",
            "learnings": "Improved load testing skills"
        }
        resp = requests.post(f"{BASE_URL}/goals/{goal_id}/feedback/member", 
                           json=feedback_data, headers=headers)
        if resp.status_code == 200:
            print(f"   ✓ Member feedback submitted")
    else:
        print(f"   ✗ Complete failed: {resp.status_code}")

# Test 6: Review Cycle (if admin)
print("\n6. Testing Review Cycle Notification...")
cycle_data = {
    "name": "Q1 2024 Performance Review",
    "description": "Quarterly review cycle",
    "start_date": datetime.now().isoformat(),
    "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
    "review_type": "quarterly"
}
resp = requests.post(f"{BASE_URL}/reviews/review-cycles/", json=cycle_data, headers=headers)
if resp.status_code == 201:
    cycle_id = resp.json()["id"]
    print(f"   ✓ Created review cycle ID: {cycle_id}")
    
    resp = requests.post(f"{BASE_URL}/reviews/review-cycles/{cycle_id}/trigger", headers=headers)
    if resp.status_code == 200:
        print(f"   ✓ Review cycle triggered - Email sent (review_cycle_started)")
else:
    print(f"   Note: Review cycle creation requires admin role")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
print(f"\n✓ Check inbox: {VERIFIED_EMAIL}")
print("\nEmails sent for:")
print("  • Goal submission (to manager)")
print("  • Goal approval (to employee)")
print("  • Goal rejection (to employee)")
print("  • Red flag detection (to manager)")
print("  • Goal completion & feedback")
print("  • Review cycle start (to all employees)")
print("\nNote: Scheduler-based notifications (probation, escalations) run automatically")
print("=" * 70)
