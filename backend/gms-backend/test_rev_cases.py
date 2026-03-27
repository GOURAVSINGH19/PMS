import requests
from datetime import date, timedelta

BASE_URL = "http://localhost:8003/api/v1"

admin_token = None
manager_token = None
member_token = None
cycle_id = None
form_id = None

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def print_header():
    print("=" * 80)
    print("PMS BACKEND - REVIEW CYCLE TEST CASES (REV-01 to REV-05)")
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
    print("Cleaning up test data...")
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

def test_rev_01():
    """Create a new Q1 Review Cycle"""
    global cycle_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    today = date.today()
    response = requests.post(
        f"{BASE_URL}/review-cycles/",
        headers=headers,
        json={
            "cycle_name": "Q1 2026 Review",
            "cycle_type": "quarterly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=90)).isoformat(),
            "self_review_deadline": (today + timedelta(days=30)).isoformat(),
            "manager_review_deadline": (today + timedelta(days=60)).isoformat()
        }
    )
    
    passed = response.status_code == 201
    if passed and response.text:
        data = response.json()
        cycle_id = data["id"]
        passed = data.get("status") == "pending"
    
    details = None
    if not passed:
        try:
            details = response.json()
        except:
            details = response.text
    
    return {
        "test_id": "REV-01",
        "scenario": "Create a new Q1 Review Cycle",
        "passed": passed,
        "expected": 201,
        "got": response.status_code,
        "details": details
    }

def test_rev_02():
    """Trigger the cycle"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.post(
        f"{BASE_URL}/review-cycles/{cycle_id}/trigger",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        passed = data.get("status") == "active" and data.get("total_forms", 0) > 0
    
    return {
        "test_id": "REV-02",
        "scenario": "Trigger the cycle",
        "passed": passed,
        "expected": "200 with forms generated",
        "got": f"{response.status_code} with {response.json().get('total_forms', 0) if response.status_code == 200 else 'error'} forms",
        "details": response.json() if not passed else None
    }

def test_rev_03():
    """Check cycle compliance"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    response = requests.get(
        f"{BASE_URL}/review-cycles/{cycle_id}/compliance",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        passed = "total_employees" in data and "pending" in data
    
    return {
        "test_id": "REV-03",
        "scenario": "Check cycle compliance",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_rev_04():
    """Submit self-assessment review form"""
    global form_id
    headers = {"Authorization": f"Bearer {member_token}"}
    
    # Get member's forms
    forms_response = requests.get(
        f"{BASE_URL}/review-forms/",
        headers=headers
    )
    
    if forms_response.status_code == 200 and forms_response.json():
        # Find self-assessment form for this cycle
        forms = forms_response.json()
        self_form = next((f for f in forms if f["review_cycle_id"] == cycle_id and f["form_type"] == "self_assessment"), None)
        
        if self_form:
            form_id = self_form["id"]
            
            response = requests.post(
                f"{BASE_URL}/review-forms/{form_id}/submit",
                headers=headers,
                json={
                    "form_data": {
                        "achievements": "Completed all assigned tasks",
                        "challenges": "Time management",
                        "goals": "Improve efficiency"
                    }
                }
            )
            
            passed = response.status_code == 200
            if passed:
                data = response.json()
                passed = data.get("status") == "submitted"
            
            return {
                "test_id": "REV-04",
                "scenario": "Submit self-assessment review form",
                "passed": passed,
                "expected": 200,
                "got": response.status_code,
                "details": response.json() if not passed else None
            }
        else:
            return {
                "test_id": "REV-04",
                "scenario": "Submit self-assessment review form",
                "passed": False,
                "expected": "Self-assessment form found",
                "got": "No self-assessment form",
                "details": forms
            }
    else:
        return {
            "test_id": "REV-04",
            "scenario": "Submit self-assessment review form",
            "passed": False,
            "expected": "Forms found",
            "got": "No forms",
            "details": forms_response.json() if forms_response.status_code == 200 else None
        }

def test_rev_05():
    """View historical performance rating"""
    headers = {"Authorization": f"Bearer {member_token}"}
    
    response = requests.get(
        f"{BASE_URL}/review-history/",
        headers=headers
    )
    
    passed = response.status_code == 200 and isinstance(response.json(), list)
    
    return {
        "test_id": "REV-05",
        "scenario": "View historical performance rating",
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
    results.append(test_rev_01())
    print_result(**results[-1])
    
    if cycle_id:
        results.append(test_rev_02())
        print_result(**results[-1])
        
        results.append(test_rev_03())
        print_result(**results[-1])
        
        results.append(test_rev_04())
        print_result(**results[-1])
        
        results.append(test_rev_05())
        print_result(**results[-1])
    
    print_summary(results)

if __name__ == "__main__":
    main()
