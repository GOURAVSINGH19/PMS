import requests
from datetime import date

BASE_URL = "http://localhost:8003/api/v1"

admin_token = None
manager_token = None
member_token = None
new_user_id = None

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def print_header():
    print("=" * 80)
    print("PMS BACKEND - USER TEST CASES (USER-01 to USER-12)")
    print("=" * 80)
    print(f"{'Test ID':<10}| {'Scenario':<45}| {'Status':<10}")
    print("-" * 80)

def print_result(test_id, scenario, passed, expected=None, got=None, details=None):
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status:<10}| {test_id:<10}| {scenario}")
    if not passed and expected and got:
        print(f"       Expected: {expected}, Got: {got}")

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
                print(f"  - {r['test_id']}: {r['scenario']} | Expected: {r.get('expected')}, Got: {r.get('got')}")

def test_user_01():
    """Create user as admin"""
    global new_user_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.post(
        f"{BASE_URL}/users/",
        headers=headers,
        json={
            "email": f"testuser{date.today().strftime('%Y%m%d')}@test.com",
            "name": "Test User",
            "password": "testpass123",
            "role": "member",
            "manager_id": 2,
            "team_id": 1,
            "date_of_joining": "2026-01-15"
        }
    )
    
    passed = response.status_code == 201
    if passed:
        new_user_id = response.json()["id"]
    
    return {"test_id": "USER-01", "scenario": "Create user as admin", "passed": passed, "expected": 201, "got": response.status_code}

def test_user_02():
    """Create user as manager"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    response = requests.post(
        f"{BASE_URL}/users/",
        headers=headers,
        json={"email": "unauthorized@test.com", "name": "Unauthorized", "password": "test123", "role": "member"}
    )
    
    passed = response.status_code == 403
    return {"test_id": "USER-02", "scenario": "Create user as manager", "passed": passed, "expected": 403, "got": response.status_code}

def test_user_03():
    """List users as admin"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    
    passed = response.status_code == 200 and isinstance(response.json(), list) and len(response.json()) > 0
    return {"test_id": "USER-03", "scenario": "List users as admin", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_04():
    """List users as manager"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    
    passed = response.status_code == 200 and isinstance(response.json(), list)
    return {"test_id": "USER-04", "scenario": "List users as manager", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_05():
    """List users as member"""
    headers = {"Authorization": f"Bearer {member_token}"}
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    
    passed = response.status_code == 200
    if passed:
        users = response.json()
        passed = len(users) == 1 and users[0]["id"] == 3
    
    return {"test_id": "USER-05", "scenario": "List users as member", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_06():
    """Get own user profile"""
    headers = {"Authorization": f"Bearer {member_token}"}
    response = requests.get(f"{BASE_URL}/users/3", headers=headers)
    
    passed = response.status_code == 200 and response.json()["id"] == 3
    return {"test_id": "USER-06", "scenario": "Get own user profile", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_07():
    """Get other user profile as member"""
    headers = {"Authorization": f"Bearer {member_token}"}
    response = requests.get(f"{BASE_URL}/users/2", headers=headers)
    
    passed = response.status_code == 403
    return {"test_id": "USER-07", "scenario": "Get other user profile as member", "passed": passed, "expected": 403, "got": response.status_code}

def test_user_08():
    """Get team member profile as manager"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    response = requests.get(f"{BASE_URL}/users/3", headers=headers)
    
    passed = response.status_code == 200
    return {"test_id": "USER-08", "scenario": "Get team member profile as manager", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_09():
    """Update own profile"""
    headers = {"Authorization": f"Bearer {member_token}"}
    response = requests.patch(
        f"{BASE_URL}/users/3",
        headers=headers,
        json={"name": "Harshit Dev Updated"}
    )
    
    passed = response.status_code == 200
    return {"test_id": "USER-09", "scenario": "Update own profile", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_10():
    """Update other user as member"""
    headers = {"Authorization": f"Bearer {member_token}"}
    response = requests.patch(
        f"{BASE_URL}/users/2",
        headers=headers,
        json={"name": "Unauthorized Update"}
    )
    
    passed = response.status_code == 403
    return {"test_id": "USER-10", "scenario": "Update other user as member", "passed": passed, "expected": 403, "got": response.status_code}

def test_user_11():
    """Update manager of user as admin"""
    if not new_user_id:
        return {"test_id": "USER-11", "scenario": "Update manager of user", "passed": False, "expected": "User created", "got": "No user"}
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.patch(
        f"{BASE_URL}/users/{new_user_id}",
        headers=headers,
        json={"manager_id": 5}
    )
    
    passed = response.status_code == 200
    return {"test_id": "USER-11", "scenario": "Update manager of user", "passed": passed, "expected": 200, "got": response.status_code}

def test_user_12():
    """Delete user as admin"""
    if not new_user_id:
        return {"test_id": "USER-12", "scenario": "Delete user", "passed": False, "expected": "User created", "got": "No user"}
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.delete(f"{BASE_URL}/users/{new_user_id}", headers=headers)
    
    passed = response.status_code == 204
    return {"test_id": "USER-12", "scenario": "Delete user", "passed": passed, "expected": 204, "got": response.status_code}

def main():
    global admin_token, manager_token, member_token
    
    print_header()
    
    admin_token = login("sandeep@opstree.com", "test")
    manager_token = login("deepak@opstree.com", "test")
    member_token = login("harshit@opstree.com", "test")
    
    if not all([admin_token, manager_token, member_token]):
        print("✗ Login failed")
        return
    
    print("✓ Admin logged in successfully")
    print("✓ Manager logged in successfully")
    print("✓ Member logged in successfully")
    print("-" * 80)
    
    results = []
    
    results.append(test_user_01())
    print_result(**results[-1])
    
    results.append(test_user_02())
    print_result(**results[-1])
    
    results.append(test_user_03())
    print_result(**results[-1])
    
    results.append(test_user_04())
    print_result(**results[-1])
    
    results.append(test_user_05())
    print_result(**results[-1])
    
    results.append(test_user_06())
    print_result(**results[-1])
    
    results.append(test_user_07())
    print_result(**results[-1])
    
    results.append(test_user_08())
    print_result(**results[-1])
    
    results.append(test_user_09())
    print_result(**results[-1])
    
    results.append(test_user_10())
    print_result(**results[-1])
    
    results.append(test_user_11())
    print_result(**results[-1])
    
    results.append(test_user_12())
    print_result(**results[-1])
    
    print_summary(results)

if __name__ == "__main__":
    main()
