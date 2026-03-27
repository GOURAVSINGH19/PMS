import requests

BASE_URL = "http://localhost:8003/api/v1"

admin_token = None
manager_token = None
member_token = None

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def print_header():
    print("=" * 80)
    print("PMS BACKEND - DASHBOARD TEST CASES (DASH-01 to DASH-04)")
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

def test_dash_01():
    """Fetch personal dashboard"""
    headers = {"Authorization": f"Bearer {member_token}"}
    
    response = requests.get(
        f"{BASE_URL}/dashboard/me",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        # Check that response contains expected fields
        required_fields = ["total_goals", "active_goals", "completed_goals", "avg_completion_pct"]
        passed = all(field in data for field in required_fields)
    
    return {
        "test_id": "DASH-01",
        "scenario": "Fetch personal dashboard",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_dash_02():
    """Fetch team dashboard"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    response = requests.get(
        f"{BASE_URL}/dashboard/team",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        # Check that response contains expected fields
        required_fields = ["team_name", "members", "team_completion_pct"]
        passed = all(field in data for field in required_fields)
        if passed:
            # Verify members is a list
            passed = isinstance(data.get("members"), list)
    
    return {
        "test_id": "DASH-02",
        "scenario": "Fetch team dashboard",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_dash_03():
    """Manager tries to view company dashboard"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    response = requests.get(
        f"{BASE_URL}/dashboard/company",
        headers=headers
    )
    
    # Should get 403 Forbidden
    passed = response.status_code == 403
    
    return {
        "test_id": "DASH-03",
        "scenario": "Manager tries to view company dashboard",
        "passed": passed,
        "expected": 403,
        "got": response.status_code,
        "details": response.json() if response.status_code != 403 else None
    }

def test_dash_04():
    """Fetch company dashboard"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.get(
        f"{BASE_URL}/dashboard/company",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        data = response.json()
        # Check that response contains expected fields
        required_fields = ["total_employees", "total_goals", "active_goals", "completed_goals", "teams"]
        passed = all(field in data for field in required_fields)
        if passed:
            # Verify teams is a list
            passed = isinstance(data.get("teams"), list)
    
    return {
        "test_id": "DASH-04",
        "scenario": "Fetch company dashboard",
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
    results.append(test_dash_01())
    print_result(**results[-1])
    
    results.append(test_dash_02())
    print_result(**results[-1])
    
    results.append(test_dash_03())
    print_result(**results[-1])
    
    results.append(test_dash_04())
    print_result(**results[-1])
    
    print_summary(results)

if __name__ == "__main__":
    main()
