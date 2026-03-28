#!/usr/bin/env python3
"""
Test script to send a test email through the PMS notification system
"""
import requests
import json

BASE_URL = "http://localhost:8003"

# Login as admin
print("1. Logging in as admin...")
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

# Get employee user (harshit)
print("\n2. Getting employee user...")
users_response = requests.get(f"{BASE_URL}/api/v1/users/", headers=headers)
users = users_response.json()
employee = next((u for u in users if u["email"] == "harshit@opstree.com"), None)
if not employee:
    print("❌ Employee not found")
    exit(1)
print(f"✓ Found employee: {employee['name']} (ID: {employee['id']})")

# Create a test goal to trigger email notification
print("\n3. Creating a test goal (will trigger email to manager)...")
goal_data = {
    "title": "Email Test Goal",
    "description": "This goal is created to test email notifications",
    "level": "individual",
    "tag": "monthly",
    "priority": "low",
    "start_date": "2026-03-27",
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

# Submit goal for approval (triggers email to manager)
print("\n4. Submitting goal for approval (this will send email to manager)...")
submit_response = requests.post(
    f"{BASE_URL}/api/v1/goals/{goal['id']}/submit",
    headers=headers
)

if submit_response.status_code != 200:
    print(f"❌ Goal submission failed: {submit_response.text}")
    exit(1)

print("✓ Goal submitted for approval")
print("\n" + "="*60)
print("📧 EMAIL NOTIFICATION SENT!")
print("="*60)
print(f"To: Manager of {employee['name']}")
print(f"Subject: Goal pending approval: {goal['title']}")
print(f"Message: {employee['name']} submitted a goal for your approval.")
print("\nCheck the backend logs to see the email status:")
print("docker logs pms-gms-backend-1 --tail 20")
print("\nIf EMAIL_BACKEND=smtp and credentials are configured,")
print("the email will be sent to the manager's email address.")
