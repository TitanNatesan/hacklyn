import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def print_result(step, success, details=""):
    print(f"[{'PASS' if success else 'FAIL'}] {step}")
    if details:
        print(f"Details: {details}")
    if not success:
        sys.exit(1)

def get_results(response):
    data = response.json()
    if isinstance(data, dict) and 'results' in data:
        return data['results']
    if isinstance(data, list):
        return data
    return [] # Should not happen if successful

def main():
    print("--- Starting Verification ---")
    session = requests.Session()
    session.headers.update({'Content-Type': 'application/json'})

    # 1. Organizer
    print("\n[Step 1] Organizer Auth")
    org_creds = {
        "username": "workflow_org",
        "email": "org@workflow.com", 
        "password": "password123"
    }
    
    # Try Login
    login_resp = session.post(f"{BASE_URL}/auth/login/", json={"username": org_creds["username"], "password": org_creds["password"]})
    
    org_token = None
    if login_resp.status_code == 200:
        org_token = login_resp.json()['tokens']['access']
        print_result("Organizer Login (Existing)", True)
    else:
        # Register
        reg_payload = {
            "username": org_creds["username"],
            "email": org_creds["email"],
            "password": org_creds["password"],
            "password_confirm": org_creds["password"],
            "first_name": "Workflow",
            "last_name": "Organizer"
        }
        reg_resp = session.post(f"{BASE_URL}/auth/register/", json=reg_payload)
        if reg_resp.status_code == 201:
            org_token = reg_resp.json()['tokens']['access']
            print_result("Organizer Registration", True)
        else:
            print_result("Organizer Registration", False, f"Status: {reg_resp.status_code}, Body: {reg_resp.text}")

    org_headers = {"Authorization": f"Bearer {org_token}"}
    
    # 2. Create Event
    print("\n[Step 2] Create Event")
    event_data = {
        "name": "Workflow Hackathon 2025",
        "tagline": "Automated Test Event",
        "description": "Created by verify_workflow.py",
        "start_date": "2025-06-01T09:00:00Z",
        "end_date": "2025-06-02T17:00:00Z",
        "mode": "Online",
        "max_team_size": 4,
        "is_published": True,
        "status": "published",
        "organizer_name": "Workflow Org",
        "organizer_email": "org@workflow.com"
    }
    
    # Check existing
    my_events_resp = session.get(f"{BASE_URL}/events/my/", headers=org_headers)
    my_events = get_results(my_events_resp)
    existing = next((e for e in my_events if e['name'] == event_data['name']), None)
    
    event_id = None
    if existing:
        event_id = existing['id']
        print_result("Event Exists", True, f"ID: {event_id}")
    else:
        create_resp = session.post(f"{BASE_URL}/events/", json=event_data, headers=org_headers)
        if create_resp.status_code == 201:
            event_id = create_resp.json()['id']
            print_result("Event Created", True, f"ID: {event_id}")
        else:
            print_result("Event Creation", False, create_resp.text)
            
    # 3. Participant
    print("\n[Step 3] Participant Auth")
    part_creds = {
        "username": "workflow_part", 
        "email": "part@workflow.com", 
        "password": "password123"
    }
    
    login_resp = session.post(f"{BASE_URL}/auth/login/", json={"username": part_creds["username"], "password": part_creds["password"]})
    part_token = None
    
    if login_resp.status_code == 200:
        part_token = login_resp.json()['tokens']['access']
        print_result("Participant Login", True)
    else:
        reg_payload = {
            "username": part_creds["username"],
            "email": part_creds["email"],
            "password": part_creds["password"],
            "password_confirm": part_creds["password"],
            "first_name": "Workflow",
            "last_name": "Participant"
        }
        reg_resp = session.post(f"{BASE_URL}/auth/register/", json=reg_payload)
        if reg_resp.status_code == 201:
            part_token = reg_resp.json()['tokens']['access']
            print_result("Participant Registration", True)
        else:
            print_result("Participant Registration", False, reg_resp.text)

    part_headers = {"Authorization": f"Bearer {part_token}"}
    
    # 4. Apply
    print("\n[Step 4] Apply")
    apps_resp = session.get(f"{BASE_URL}/events/applications/my/", headers=part_headers)
    my_apps = get_results(apps_resp)
    existing_app = next((a for a in my_apps if a['event'] == event_id), None)
    
    app_id = None
    if existing_app:
        app_id = existing_app['id']
        print_result("Already Applied", True, f"App ID: {app_id}")
    else:
        apply_data = {
            "team_name": "Workflow Team",
            "role": "Developer",
            "motivation": "Automated testing is fun"
        }
        apply_resp = session.post(f"{BASE_URL}/events/{event_id}/apply/", json=apply_data, headers=part_headers)
        if apply_resp.status_code == 201:
            app_id = apply_resp.json()['id']
            print_result("Applied Successfully", True, f"App ID: {app_id}")
        else:
            print_result("Application Failed", False, apply_resp.text)
            
    # 5. Approve
    print("\n[Step 5] Approve Application")
    # Get app detail as organizer to confirm ID
    org_apps_resp = session.get(f"{BASE_URL}/events/{event_id}/applications/", headers=org_headers)
    if not org_apps_resp.ok:
        print_result("Get Applications", False, org_apps_resp.text)
        
    org_apps = get_results(org_apps_resp)
    org_target_app = next((a for a in org_apps if a['id'] == app_id), None)
    
    if not org_target_app:
        print_result("Find Application", False, "Application not found in organizer list")
        
    print(f"Current Status: {org_target_app.get('status')}")
    print(f"Reviewing App ID: {app_id} for Event ID: {event_id} with action='approve'")
    print(f"Session Headers: {session.headers}")
    
    review_url = f"{BASE_URL}/events/{event_id}/applications/{app_id}/review/"
    review_resp = session.post(review_url, json={"action": "approve"}, headers=org_headers)
    
    print(f"Response Status: {review_resp.status_code}")
    print(f"Response Body: {review_resp.text}")
    
    if review_resp.status_code == 200:
        status = review_resp.json()['status']
        print_result("Review Action", status == "approved", f"New Status: {status}")
    else:
        print_result("Review Action", False, review_resp.text)

if __name__ == "__main__":
    main()
