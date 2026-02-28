import requests
import time
import json
import random
from datetime import datetime

# Configuration
# Note: Ensure the Next.js server is running on localhost:3000
API_URL = "http://localhost:3000/api/edge/ingest"

# Real IDs from the initial database setup
SITE_ID = "1d1c2a8c-b6fa-4dc9-b09c-109d15f86750"
ZONE_ID = "06ade444-1b5a-4b09-8ef9-102e6e17690e" # Zone 2 (Structure)

def send_ppe_alert():
    """Simulates a PPE violation detection."""
    payload = {
        "siteId": SITE_ID,
        "zoneId": ZONE_ID,
        "type": "PPE",
        "payload": {
            "violation": True,
            "details": "Safety Vest Missing",
            "confidence": 0.91,
            "severity": "high"
        }
    }
    try:
        response = requests.post(API_URL, json=payload)
        print(f"PPE Alert sent. Response: {response.status_code}, {response.json()}")
    except Exception as e:
        print(f"Error sending PPE Alert: {e}")

def send_progress_update():
    """Simulates a zone progress update."""
    # Update Zone 4 progress
    zone4_id = "38e2bfbb-e372-4405-9b00-5b3f691d4aeb"
    payload = {
        "siteId": SITE_ID,
        "zoneId": zone4_id,
        "type": "Progress",
        "payload": {
            "progress": random.randint(15, 25),
            "method": "Drone CV Survey"
        }
    }
    try:
        response = requests.post(API_URL, json=payload)
        print(f"Progress update sent. Response: {response.status_code}, {response.json()}")
    except Exception as e:
        print(f"Error sending Progress Update: {e}")

def send_material_verification():
    """Simulates a material verification."""
    materials = [
        {"name": "Cement Bags", "qty": "500 Bags", "status": "verified"},
        {"name": "Steel Rebar", "qty": "12 Tons", "status": "mismatch"},
        {"name": "Bricks", "qty": "10,000 Units", "status": "verified"}
    ]
    mat = random.choice(materials)
    payload = {
        "siteId": SITE_ID,
        "zoneId": ZONE_ID,
        "type": "Material",
        "payload": {
            "name": mat["name"],
            "quantity": mat["qty"],
            "status": mat["status"]
        }
    }
    try:
        response = requests.post(API_URL, json=payload)
        print(f"Material verification ({mat['name']}) sent. Response: {response.status_code}, {response.json()}")
    except Exception as e:
        print(f"Error sending Material verification: {e}")

if __name__ == "__main__":
    print("------------------------------------------")
    print("  ARAGORN AI - EDGE SIMULATION SUITE v2.0 ")
    print("------------------------------------------")
    print(f"Targeting Site: {SITE_ID}")
    
    # Send some simulated data
    send_ppe_alert()
    time.sleep(1.5)
    send_progress_update()
    time.sleep(1.5)
    send_material_verification()
    
    print("\nSimulation complete.")
    print("Real-time Dashboard should reflect updates via Supabase WebSockets.")
    print("------------------------------------------")
