#!/usr/bin/env python3
"""
Test script to send email via Resend
"""
import requests

BASE_URL = "http://localhost:8003"

print("="*60)
print("PMS Email Test - Using Resend")
print("="*60)

# Login as admin
print("\n1. Logging in as admin...")
login_response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json={"email": "sandeep@opstree.com", "password": "test"}
)
if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✓ Logged in successfully")

# Get employee user
print("\n2. Getting employee user...")
users_response = requests.get(f"{BASE_URL}/api/v1/users/", headers=headers)
users = users_response.json()
employee = next((u for u in users if u["email"] == "harshit@opstree.com"), None)
if not employee:
    print("❌ Employee not found")
    exit(1)
print(f"✓ Found employee: {employee['name']} (ID: {employee['id']})")

# Get manager
manager = None
if employee.get("manager_id"):
    manager = next((u for u in users if u["id"] == employee["manager_id"]), None)
    if manager:
        print(f"✓ Manager: {manager['name']} ({manager['email']})")

# Create test goal in DRAFT status
print("\n3. Creating test goal in DRAFT status...")
goal_data = {
    "title": "Resend Email Test Goal",
    "description": "Testing Resend email integration",
    "level": "individual",
    "tag": "monthly",
    "priority": "low",
    "start_date": "2026-03-27",
    "creator_id": employee["id"],
    "assignee_id": employee["id"]
}

goal_response = requests.post(
    f"{BASE_URL}/api/v1/goals/",
    headers=headers,
    json=goal_data
)

if goal_response.status_code != 201:
    print(f"❌ Goal creation failed: {goal_response.text}")
    exit(1)

goal = goal_response.json()
print(f"✓ Goal created: {goal['title']} (ID: {goal['id']})")

# Submit goal (triggers email)
print("\n4. Submitting goal for approval...")
print("   This will send email via Resend API...")
submit_response = requests.post(
    f"{BASE_URL}/api/v1/goals/{goal['id']}/submit",
    headers=headers
)

if submit_response.status_code != 200:
    print(f"❌ Goal submission failed: {submit_response.text}")
    exit(1)

print("✓ Goal submitted successfully")

print("\n" + "="*60)
print("📧 EMAIL SENT VIA RESEND!")
print("="*60)
if manager:
    print(f"To: {manager['email']}")
else:
    print("To: Manager (email not found)")
print(f"Subject: Goal pending approval: {goal['title']}")
print(f"From: PMS Platform <onboarding@resend.dev>")
print("\n✨ Benefits of Resend:")
print("  • Lightning-fast HTTP API (no slow SMTP)")
print("  • Beautiful email tracking dashboard")
print("  • No spam folder issues")
print("  • Professional email templates")
print("\nCheck backend logs:")
print("  docker logs pms-gms-backend-1 --tail 30")
print("\nCheck Resend dashboard:")
print("  https://resend.com/emails")
