#!/usr/bin/env python3
"""
Quick test to verify SMTP email configuration.
This will attempt to send a test email using your SMTP settings.
"""

import requests
from datetime import datetime

BASE_URL = "http://localhost:8003/api/v1"

# Use existing admin user
ADMIN_EMAIL = "jain.samyak1908+admin@gmail.com"
ADMIN_PASSWORD = "password123"

# Test users
EMPLOYEE_EMAIL = "harshit.verma@opstree.com"
MANAGER_EMAIL = "gourav.singh@opstree.com"

print("=" * 70)
print("SMTP EMAIL TEST")
print("=" * 70)
print()

# Login as admin
print("📌 Logging in as admin...")
resp = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
if resp.status_code != 200:
    print(f"❌ Login failed: {resp.text}")
    exit(1)

admin_token = resp.json()["access_token"]
print(f"✅ Logged in as {ADMIN_EMAIL}")
print()

# Get users
headers = {"Authorization": f"Bearer {admin_token}"}
resp = requests.get(f"{BASE_URL}/users/", headers=headers)
users = resp.json()

employee = next((u for u in users if u["email"] == EMPLOYEE_EMAIL), None)
manager = next((u for u in users if u["email"] == MANAGER_EMAIL), None)

if not employee or not manager:
    print("❌ Test users not found. Run test_all_notifications_final.py first.")
    exit(1)

print(f"✅ Found employee: {employee['name']} ({employee['email']})")
print(f"✅ Found manager: {manager['name']} ({manager['email']})")
print()

# Login as employee
print("📌 Logging in as employee...")
resp = requests.post(f"{BASE_URL}/auth/login", json={"email": EMPLOYEE_EMAIL, "password": "Test@123"})
if resp.status_code != 200:
    print(f"❌ Employee login failed: {resp.text}")
    exit(1)

emp_token = resp.json()["access_token"]
print(f"✅ Logged in as {EMPLOYEE_EMAIL}")
print()

# Create and submit a goal to trigger email
print("📌 Creating test goal...")
goal_data = {
    "title": f"SMTP Test Goal - {datetime.now().strftime('%H:%M:%S')}",
    "description": "Testing SMTP email notification system",
    "level": "individual",
    "tag": "weekly",
    "priority": "medium",
    "start_date": datetime.now().date().isoformat(),
    "assignee_id": employee["id"]
}

headers_emp = {"Authorization": f"Bearer {emp_token}"}
resp = requests.post(f"{BASE_URL}/goals/", json=goal_data, headers=headers_emp)
if resp.status_code != 201:
    print(f"❌ Goal creation failed: {resp.text}")
    exit(1)

goal_id = resp.json()["id"]
print(f"✅ Created goal ID: {goal_id}")
print()

# Submit goal to trigger email notification
print("📌 Submitting goal (this will trigger email to manager)...")
resp = requests.post(f"{BASE_URL}/goals/{goal_id}/submit", headers=headers_emp)
if resp.status_code != 200:
    print(f"❌ Goal submission failed: {resp.text}")
    exit(1)

print(f"✅ Goal submitted successfully!")
print()

print("=" * 70)
print("TEST COMPLETE")
print("=" * 70)
print()
print("📧 Email should be sent to:", MANAGER_EMAIL)
print()
print("🔍 Check backend logs:")
print("   docker logs pms-gms-backend-1 --tail 30 | grep EMAIL")
print()
print("Expected log output:")
print("   [EMAIL SENT] To: gourav.singh@opstree.com | Subject: ... | Via: SMTP")
print()
print("If you see [EMAIL STUB] instead:")
print("   - Check .env has SMTP_USER and SMTP_PASSWORD set")
print("   - Make sure EMAIL_BACKEND=smtp")
print("   - Rebuild: docker compose build gms-backend")
print()
print("If you see [EMAIL ERROR]:")
print("   - Check SMTP credentials are correct")
print("   - For Gmail: Use App Password (not regular password)")
print("   - Enable 2FA and generate App Password at:")
print("     https://myaccount.google.com/apppasswords")
print()
print("=" * 70)
