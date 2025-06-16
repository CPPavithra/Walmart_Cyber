import json
from datetime import datetime
from pathlib import Path

LOG_FILE = "honeypot_logs.json"
BAN_FILE = "banned_ips.json"

Path(LOG_FILE).touch(exist_ok=True)
Path(BAN_FILE).touch(exist_ok=True)

if Path(LOG_FILE).stat().st_size == 0:
    with open(LOG_FILE, 'w') as f:
        json.dump([], f)

if Path(BAN_FILE).stat().st_size == 0:
    with open(BAN_FILE, 'w') as f:
        json.dump([], f)

def log_event(ip: str, event_type: str):
    with open(LOG_FILE, "r+") as f:
        logs = json.load(f)
        logs.append({"ip": ip, "event": event_type, "timestamp": str(datetime.now())})
        f.seek(0)
        json.dump(logs, f, indent=2)

def ban_ip(ip: str):
    with open(BAN_FILE, "r+") as f:
        data = json.load(f)
        if ip not in data:
            data.append(ip)
        f.seek(0)
        json.dump(data, f, indent=2)

def is_ip_banned(ip: str):
    with open(BAN_FILE, "r") as f:
        return ip in json.load(f)
