import requests

BASE_URL = "http://localhost:8003/api/v1"

admin_token = None
manager_token = None
member_token = None
notification_id = None
flag_id = None

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def print_header():
    print("=" * 80)
    print("PMS BACKEND - NOTIFICATION, FLAG & REPORT TEST CASES")
    print("=" * 80)
    print(f"{'Test ID':<8}| {'Scenario':<50}| {'Status':<10}")
    print("-" * 80)

def print_result(test_id, scenario, passed, expected=None, got=None, details=None):
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status:<8}| {test_id:<8}| {scenario}")
    if not passed and expected and got:
        print(f"       Expected: {expected}, Got: {got}")
        if details:
            print(f"       Details: {details}")

def print_summary(results):
    print("-" * 80)
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for r in results if r["passed"])
    failed = len(results) - passed
    print(f"Total Tests:   {len(results)}")
    print(f"✓ Passed:      {passed}")
    print(f"✗ Failed:      {failed}")
    print(f"Success Rate:  {(passed/len(results)*100):.1f}%")
    print("=" * 80)
    
    if failed > 0:
        print(f"\nFAILED TESTS ({failed}):")
        for r in results:
            if not r["passed"]:
                print(f"  - {r['test_id']}: {r['scenario']} | Expected: {r.get('expected')}, Got: {r.get('got')} | {r.get('details', '')}")

def test_notif_01():
    """Get unread notifications count"""
    headers = {"Authorization": f"Bearer {member_token}"}
    
    response = requests.get(
        f"{BASE_URL}/notifications/unread-count",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        passed = "unread_count" in data and isinstance(data["unread_count"], int)
    
    return {
        "test_id": "NOTIF-01",
        "scenario": "Get unread notifications count",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_notif_02():
    """Mark specific notification as read"""
    global notification_id
    headers = {"Authorization": f"Bearer {member_token}"}
    
    # First get notifications to find one to mark as read
    list_response = requests.get(
        f"{BASE_URL}/notifications/",
        headers=headers
    )
    
    if list_response.status_code == 200 and list_response.json():
        notifications = list_response.json()
        # Find an unread notification
        unread = next((n for n in notifications if not n.get("is_read")), None)
        
        if unread:
            notification_id = unread["id"]
        elif notifications:
            # Use any notification if none are unread
            notification_id = notifications[0]["id"]
        
        if notification_id:
            response = requests.patch(
                f"{BASE_URL}/notifications/{notification_id}/read",
                headers=headers
            )
            
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = data.get("is_read") == True
            
            return {
                "test_id": "NOTIF-02",
                "scenario": "Mark specific notification as read",
                "passed": passed,
                "expected": 200,
                "got": response.status_code,
                "details": response.json() if not passed else None
            }
    
    return {
        "test_id": "NOTIF-02",
        "scenario": "Mark specific notification as read",
        "passed": False,
        "expected": "Notification found",
        "got": "No notifications",
        "details": None
    }

def test_flag_01():
    """View all system-generated red flags"""
    global flag_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.get(
        f"{BASE_URL}/admin/flags",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        passed = "goal_feedback_flags" in data and "probation_feedback_flags" in data
        if passed and data.get("probation_feedback_flags"):
            # Store first probation flag for next test
            flag_id = data["probation_feedback_flags"][0]["id"]
        elif passed:
            # Create a flagged feedback for testing if none exists
            import subprocess
            result = subprocess.run([
                "docker", "exec", "pms-postgres-1", "psql", "-U", "gms_user", "-d", "gms_db", "-c",
                "INSERT INTO probation_feedbacks (probation_trigger_id, submitted_by_id, feedback_type, form_data, is_flagged, flag_reason, submitted_at) SELECT 2, 2, 'MANAGER', '{\"performance\": 1}', true, 'Low rating', NOW() WHERE NOT EXISTS (SELECT 1 FROM probation_feedbacks WHERE is_flagged=true LIMIT 1) RETURNING id;"
            ], capture_output=True, text=True)
            # Re-fetch flags
            response = requests.get(f"{BASE_URL}/admin/flags", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("probation_feedback_flags"):
                    flag_id = data["probation_feedback_flags"][0]["id"]
    
    return {
        "test_id": "FLAG-01",
        "scenario": "View all system-generated red flags",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_flag_02():
    """Resolve a probation red flag"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    if not flag_id:
        return {
            "test_id": "FLAG-02",
            "scenario": "Resolve a probation red flag",
            "passed": False,
            "expected": "Flag found",
            "got": "No flags to resolve",
            "details": None
        }
    
    response = requests.post(
        f"{BASE_URL}/admin/flags/probation/{flag_id}/resolve",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        passed = "message" in data
    
    return {
        "test_id": "FLAG-02",
        "scenario": "Resolve a probation red flag",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_rep_01():
    """Download overall Goal Report"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.get(
        f"{BASE_URL}/admin/reports/goals",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        passed = "data" in data and "total" in data and isinstance(data["data"], list)
    
    return {
        "test_id": "REP-01",
        "scenario": "Download overall Goal Report",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def main():
    global admin_token, manager_token, member_token
    
    print_header()
    
    # Login
    admin_token = login("sandeep@opstree.com", "test")
    manager_token = login("deepak@opstree.com", "test")
    member_token = login("harshit@opstree.com", "test")
    
    if not all([admin_token, manager_token, member_token]):
        print("✗ Login failed")
        return
    
    print("✓ Admin logged in successfully")
    print("✓ Manager logged in successfully")
    print("✓ Employee logged in successfully")
    print("-" * 80)
    
    results = []
    
    # Run tests
    results.append(test_notif_01())
    print_result(**results[-1])
    
    results.append(test_notif_02())
    print_result(**results[-1])
    
    results.append(test_flag_01())
    print_result(**results[-1])
    
    results.append(test_flag_02())
    print_result(**results[-1])
    
    results.append(test_rep_01())
    print_result(**results[-1])
    
    print_summary(results)

if __name__ == "__main__":
    main()
