import requests

BASE_URL = "http://localhost:8003/api/v1"

admin_token = None
manager_token = None
member_token = None
team_id = None
other_team_id = None

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def print_header():
    print("=" * 80)
    print("PMS BACKEND - TEAM TEST CASES (TEAM-01 to TEAM-06)")
    print("=" * 80)
    print(f"{'Test ID':<10}| {'Scenario':<45}| {'Status':<10}")
    print("-" * 80)

def print_result(test_id, scenario, passed, expected=None, got=None, details=None):
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status:<10}| {test_id:<10}| {scenario}")
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
                print(f"  - {r['test_id']}: {r['scenario']} | Expected: {r.get('expected')}, Got: {r.get('got')}")

def test_team_01():
    """Create team as admin"""
    global team_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.post(
        f"{BASE_URL}/teams/",
        headers=headers,
        json={"name": "Test Team Alpha", "description": "Test team for validation"}
    )
    
    passed = response.status_code == 201
    if passed:
        team_id = response.json()["id"]
    
    return {
        "test_id": "TEAM-01",
        "scenario": "Create team as admin",
        "passed": passed,
        "expected": 201,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_team_02():
    """Create team as non-admin (manager)"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    response = requests.post(
        f"{BASE_URL}/teams/",
        headers=headers,
        json={"name": "Unauthorized Team", "description": "Should fail"}
    )
    
    passed = response.status_code == 403
    
    return {
        "test_id": "TEAM-02",
        "scenario": "Create team as non-admin",
        "passed": passed,
        "expected": 403,
        "got": response.status_code,
        "details": response.json() if response.status_code != 403 else None
    }

def test_team_03():
    """List teams as admin"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.get(
        f"{BASE_URL}/teams/",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        teams = response.json()
        passed = isinstance(teams, list) and len(teams) > 0
    
    return {
        "test_id": "TEAM-03",
        "scenario": "List teams as admin",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_team_04():
    """List teams as manager"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    response = requests.get(
        f"{BASE_URL}/teams/",
        headers=headers
    )
    
    passed = response.status_code == 200
    if passed:
        teams = response.json()
        passed = isinstance(teams, list)
    
    return {
        "test_id": "TEAM-04",
        "scenario": "List teams as manager",
        "passed": passed,
        "expected": 200,
        "got": response.status_code,
        "details": response.json() if not passed else None
    }

def test_team_05():
    """Get team details as manager (own team)"""
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    # Get manager's team_id first
    user_response = requests.get(f"{BASE_URL}/users/2", headers=headers)
    if user_response.status_code == 200:
        manager_team_id = user_response.json().get("team_id")
        
        if manager_team_id:
            response = requests.get(
                f"{BASE_URL}/teams/{manager_team_id}",
                headers=headers
            )
            
            passed = response.status_code == 200
            
            return {
                "test_id": "TEAM-05",
                "scenario": "Get team details (own team)",
                "passed": passed,
                "expected": 200,
                "got": response.status_code,
                "details": response.json() if not passed else None
            }
    
    return {
        "test_id": "TEAM-05",
        "scenario": "Get team details (own team)",
        "passed": False,
        "expected": "Manager has team",
        "got": "No team found",
        "details": None
    }

def test_team_06():
    """Get team details - unauthorized (different team)"""
    global other_team_id
    headers = {"Authorization": f"Bearer {manager_token}"}
    
    # Get all teams and find one that's not manager's team
    teams_response = requests.get(f"{BASE_URL}/teams/", headers={"Authorization": f"Bearer {admin_token}"})
    user_response = requests.get(f"{BASE_URL}/users/2", headers=headers)
    
    if teams_response.status_code == 200 and user_response.status_code == 200:
        teams = teams_response.json()
        manager_team_id = user_response.json().get("team_id")
        
        # Find a different team
        other_team = next((t for t in teams if t["id"] != manager_team_id), None)
        
        if other_team:
            other_team_id = other_team["id"]
            response = requests.get(
                f"{BASE_URL}/teams/{other_team_id}",
                headers=headers
            )
            
            passed = response.status_code == 403
            
            return {
                "test_id": "TEAM-06",
                "scenario": "Get team details - unauthorized",
                "passed": passed,
                "expected": 403,
                "got": response.status_code,
                "details": response.json() if response.status_code != 403 else None
            }
    
    return {
        "test_id": "TEAM-06",
        "scenario": "Get team details - unauthorized",
        "passed": False,
        "expected": "Different team found",
        "got": "Could not find different team",
        "details": None
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
    print("✓ Member logged in successfully")
    print("-" * 80)
    
    results = []
    
    # Run tests
    results.append(test_team_01())
    print_result(**results[-1])
    
    results.append(test_team_02())
    print_result(**results[-1])
    
    results.append(test_team_03())
    print_result(**results[-1])
    
    results.append(test_team_04())
    print_result(**results[-1])
    
    results.append(test_team_05())
    print_result(**results[-1])
    
    results.append(test_team_06())
    print_result(**results[-1])
    
    print_summary(results)

if __name__ == "__main__":
    main()
