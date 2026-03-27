#!/usr/bin/env python3
import urllib.request
import urllib.error
import json

BASE = "http://localhost:8003"

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# Login admin
status, data = req("POST", "/api/v1/auth/login", {"email": "sandeep@opstree.com", "password": "test"})
assert status == 200, f"Admin login failed: {data}"
admin_token = data["access_token"]
print(f"✅ Admin login OK  (role={data['role']})")

# Login member
status, data = req("POST", "/api/v1/auth/login", {"email": "harshit@opstree.com", "password": "test"})
assert status == 200, f"Member login failed: {data}"
member_token = data["access_token"]
print(f"✅ Member login OK (role={data['role']})")

# Health
status, data = req("GET", "/health")
assert status == 200
print(f"✅ /health → {data}")

# Dashboard /me
status, data = req("GET", "/api/v1/dashboard/me", token=member_token)
assert status == 200, f"dashboard/me failed: {data}"
print(f"✅ /dashboard/me → total_goals={data['total_goals']}, unread={data['unread_notifications']}")

# Dashboard /company
status, data = req("GET", "/api/v1/dashboard/company", token=admin_token)
assert status == 200, f"dashboard/company failed: {data}"
print(f"✅ /dashboard/company → employees={data['total_employees']}, goals={data['total_goals']}")

# Dashboard /team
status, data = req("GET", "/api/v1/dashboard/team", token=admin_token)
assert status == 200, f"dashboard/team failed: {data}"
print(f"✅ /dashboard/team → members={len(data['members'])}")

# Notifications
status, data = req("GET", "/api/v1/notifications/unread-count", token=member_token)
assert status == 200, f"notifications failed: {data}"
print(f"✅ /notifications/unread-count → {data}")

# Probation list
status, data = req("GET", "/api/v1/probation/", token=admin_token)
assert status == 200, f"probation list failed: {data}"
print(f"✅ /probation/ → {len(data)} records")

# Create probation record
status, data = req("POST", "/api/v1/probation/", {"employee_id": 3, "date_of_joining": "2026-01-01"}, token=admin_token)
if status == 201:
    print(f"✅ POST /probation/ → id={data['id']}, status={data['probation_status']}")
    record_id = data["id"]
else:
    print(f"ℹ️  POST /probation/ → {status}: {data.get('detail')}")
    status2, data2 = req("GET", "/api/v1/probation/employee/3", token=admin_token)
    record_id = data2["id"] if status2 == 200 else None

# Review cycles list
status, data = req("GET", "/api/v1/review-cycles/", token=admin_token)
assert status == 200, f"review-cycles failed: {data}"
print(f"✅ /review-cycles/ → {len(data)} cycles")

# Create review cycle
status, data = req("POST", "/api/v1/review-cycles/", {
    "cycle_name": "Q1 2026",
    "cycle_type": "quarterly",
    "start_date": "2026-01-01",
    "end_date": "2026-03-31",
    "self_review_deadline": "2026-03-15",
    "manager_review_deadline": "2026-03-25"
}, token=admin_token)
if status == 201:
    print(f"✅ POST /review-cycles/ → id={data['id']}, status={data['status']}")
else:
    print(f"ℹ️  POST /review-cycles/ → {status}: {data.get('detail')}")

# Admin flags
status, data = req("GET", "/api/v1/admin/flags", token=admin_token)
assert status == 200, f"admin/flags failed: {data}"
print(f"✅ /admin/flags → goal_flags={len(data['goal_feedback_flags'])}, probation_flags={len(data['probation_feedback_flags'])}")

# Reports
status, data = req("GET", "/api/v1/admin/reports/goals", token=admin_token)
assert status == 200, f"reports/goals failed: {data}"
print(f"✅ /admin/reports/goals → total={data['total']}")

status, data = req("GET", "/api/v1/admin/reports/probation", token=admin_token)
assert status == 200, f"reports/probation failed: {data}"
print(f"✅ /admin/reports/probation → total={data['total']}")

status, data = req("GET", "/api/v1/admin/reports/reviews", token=admin_token)
assert status == 200, f"reports/reviews failed: {data}"
print(f"✅ /admin/reports/reviews → total={data['total']}")

# Review forms
status, data = req("GET", "/api/v1/review-forms/", token=member_token)
assert status == 200, f"review-forms failed: {data}"
print(f"✅ /review-forms/ → {len(data)} forms")

print("\n🎉 All smoke tests passed!")
