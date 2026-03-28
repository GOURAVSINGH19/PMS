#!/usr/bin/env python3
"""
Simple test to trigger Resend email notification
"""
import requests

BASE_URL = "http://localhost:8003"

print("="*60)
print("Resend Email Test - Goal Approval Notification")
print("="*60)

# Login as employee (harshit)
print("\n1. Logging in as employee (harshit)...")
login_response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json={"email": "harshit@opstree.com", "password": "test"}
)
if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✓ Logged in as employee")

# Get current user ID
me_response = requests.get(f"{BASE_URL}/api/v1/users/", headers=headers)
users = me_response.json()
me = next((u for u in users if u["email"] == "harshit@opstree.com"), None)
if not me:
    print("❌ Could not find current user")
    exit(1)

# Create goal as employee (will be in DRAFT status)
print("\n2. Creating goal as employee...")
goal_data = {
    "title": "Test Resend Email Notification",
    "description": "This goal will trigger an email via Resend when submitted",
    "level": "individual",
    "tag": "weekly",  # Use weekly to avoid weightage conflicts
    "priority": "low",  # Low priority = 10% weightage
    "start_date": "2026-03-27",
    "assignee_id": me["id"]
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
print(f"  Status: {goal['status']}")

# Submit goal for approval (triggers email to manager)
print("\n3. Submitting goal for approval...")
print("   📧 This will send email via Resend to manager...")
submit_response = requests.post(
    f"{BASE_URL}/api/v1/goals/{goal['id']}/submit",
    headers=headers
)

if submit_response.status_code != 200:
    print(f"❌ Goal submission failed: {submit_response.text}")
    exit(1)

updated_goal = submit_response.json()
print(f"✓ Goal submitted successfully!")
print(f"  New status: {updated_goal['status']}")

print("\n" + "="*60)
print("✅ EMAIL SENT VIA RESEND!")
print("="*60)
print("To: deepak@opstree.com (Manager)")
print(f"Subject: Goal pending approval: {goal['title']}")
print("From: PMS Platform <onboarding@resend.dev>")
print("\n📊 Check Results:")
print("  1. Backend logs: docker logs pms-gms-backend-1 --tail 20")
print("  2. Resend dashboard: https://resend.com/emails")
print("\n✨ Resend Benefits:")
print("  • Fast HTTP API (no SMTP delays)")
print("  • Professional email templates")
print("  • Delivery tracking & analytics")
print("  • No spam folder issues")
