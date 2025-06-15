#!/usr/bin/env python3
import subprocess
import json
import time
from datetime import datetime

def monitor_kubernetes():
    print("🔍 Starting Kubernetes Threat Monitor")
    
    while True:
        try:
            # Get live events
            events = subprocess.check_output(
                "kubectl get events --sort-by=.metadata.creationTimestamp -o json",
                shell=True
            )
            events_json = json.loads(events)
            
            # Process events
            for event in events_json['items']:
                if "neuroretailx" in event['metadata']['name']:
                    log_event(event)
                    
                    # Detect specific threats
                    if "BackOff" in event['reason']:
                        trigger_alert("CRITICAL: Container crash detected!")
                    elif "OOMKilled" in event['reason']:
                        trigger_alert("WARNING: Out of memory!")
            
            time.sleep(2)
            
        except Exception as e:
            print(f"Monitoring error: {e}")
            time.sleep(5)

def log_event(event):
    timestamp = event['lastTimestamp']
    reason = event['reason']
    message = event['message']
    print(f"[{timestamp}] {reason}: {message}")

def trigger_alert(message):
    print(f"🚨 ALERT: {message}")
    # Uncomment to play alert sound (Linux/Mac)
    # subprocess.run(["afplay", "/System/Library/Sounds/Sosumi.aiff"])

if __name__ == "__main__":
    monitor_kubernetes()
