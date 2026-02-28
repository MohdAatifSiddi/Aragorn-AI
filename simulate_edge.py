import requests
import json
import random
import time
from datetime import datetime

# Configuration
API_URL = "http://localhost:3000/api/edge/ingest"
SITE_ID = "1d1c2a8c-b6fa-4dc9-b09c-109d15f86750" # Demo site ID: Tesla Giga Mumbai

# Real Zone IDs from the database
ZONES = [
    {"id": "e4636f5e-1981-4abc-a258-cd64643bdaea", "name": "Excavation"},
    {"id": "3f557aea-0939-421d-90e8-fbc1f541087c", "name": "Foundations"},
    {"id": "01906adb-ee3e-4f87-b138-ef417c652009", "name": "Steel Framing"},
    {"id": "a7e18699-9c7e-42af-9f1c-096fe24dd6d5", "name": "Electrical"},
    {"id": "4e5e172e-3136-4db4-ad23-db3f238fc905", "name": "Finishing"}
]

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def simulate_ppe_violation():
    zone = random.choice(ZONES)
    log(f"Simulating PPE Violation in {zone['name']}...")
    payload = {
        "siteId": SITE_ID,
        "zoneId": zone['id'],
        "type": "PPE",
        "payload": {
            "violation": "NO_HELMET",
            "severity": "high",
            "details": f"Worker detected without hard hat in {zone['name']}.",
            "confidence": 0.98
        }
    }
    try:
        r = requests.post(API_URL, json=payload)
        log(f"Response: {r.status_code} - {r.json()}")
    except Exception as e:
        log(f"Error: {e}")

def simulate_progress_update():
    zone = random.choice(ZONES)
    log(f"Simulating Progress Milestone Update for {zone['name']}...")
    payload = {
        "siteId": SITE_ID,
        "zoneId": zone['id'],
        "type": "PROGRESS",
        "payload": {
            "progress_percent": random.randint(10, 95),
            "zone_name": zone['name']
        }
    }
    try:
        r = requests.post(API_URL, json=payload)
        log(f"Response: {r.status_code} - {r.json()}")
    except Exception as e:
        log(f"Error: {e}")

def simulate_material_verification():
    materials = [
        {"name": "Portland Cement (Grade 43)", "qty": "250 Bags"},
        {"name": "Structural Steel (I-Beams)", "qty": "12 Tons"},
        {"name": "Copper Wiring (Spools)", "qty": "50 Units"},
        {"name": "Rebar (12mm)", "qty": "5 Tons"}
    ]
    mat = random.choice(materials)
    log(f"Simulating Material Ledger Verification for {mat['name']}...")
    payload = {
        "siteId": SITE_ID,
        "type": "MATERIAL",
        "payload": {
            "name": mat['name'],
            "quantity": mat['qty'],
            "status": random.choice(["verified", "verified", "mismatch"]),
            "manifest_id": f"MANIFEST_{random.randint(1000, 9999)}_X"
        }
    }
    try:
        r = requests.post(API_URL, json=payload)
        log(f"Response: {r.status_code} - {r.json()}")
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    print("==========================================")
    print(" Aragorn AI: Edge Vision Simulation v2.1 ")
    print("==========================================")
    print(f"Targeting: {API_URL}")
    print(f"Site ID: {SITE_ID}")
    
    try:
        while True:
            # Randomly choose an event to simulate
            event_type = random.choice(['PPE', 'PROGRESS', 'MATERIAL', 'NONE'])
            
            if event_type == 'PPE':
                simulate_ppe_violation()
            elif event_type == 'PROGRESS':
                simulate_progress_update()
            elif event_type == 'MATERIAL':
                simulate_material_verification()
            else:
                log("Aragorn Edge Link: Active (Monitoring Site...)")
            
            # Wait for 10-20 seconds before next event
            time.sleep(random.randint(5, 10))
            
    except KeyboardInterrupt:
        print("\nSimulation stopped.")
