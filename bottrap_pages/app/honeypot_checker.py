import json
import os
from datetime import datetime

BANNED_FILE = "banned_ips.json"
LOG_FILE = "honeypot_logs.json"

for file in [BANNED_FILE, LOG_FILE]:
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump([], f)

def get_banned_ips():
    with open(BANNED_FILE, "r") as f:
        return json.load(f)

def ban_ip(ip: str, reason: str = "Honeypot trap"):
    banned = get_banned_ips()
    if ip not in banned:
        banned.append(ip)
        with open(BANNED_FILE, "w") as f:
            json.dump(banned, f, indent=4)
        log_event(ip, reason, status="BANNED")

def log_event(ip: str, reason: str, status: str = "ATTEMPT"):
    log_entry = {
        "ip": ip,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "reason": reason,
        "status": status
    }
    with open(LOG_FILE, "r+") as f:
        logs = json.load(f)
        logs.append(log_entry)
        f.seek(0)
        json.dump(logs, f, indent=4)
