import json
from datetime import datetime
import os

BAN_LIST_FILE = "banned_ips.json"
LOG_FILE = "app/logs/access.log"

# Load or initialize banned IP list
if not os.path.exists(BAN_LIST_FILE):
    with open(BAN_LIST_FILE, "w") as f:
        json.dump([], f)

def is_ip_banned(ip):
    with open(BAN_LIST_FILE) as f:
        banned = json.load(f)
    return ip in banned

def ban_ip(ip):
    with open(BAN_LIST_FILE) as f:
        banned = json.load(f)
    if ip not in banned:
        banned.append(ip)
        with open(BAN_LIST_FILE, "w") as fw:
            json.dump(banned, fw)


def log_access(request, trap=False):
    ip = request.client.host
    ua = request.headers.get("user-agent", "none")
    path = request.url.path
    with open(LOG_FILE, "a") as f:
        f.write(f"[{datetime.now()}] IP: {ip} | Path: {path} | Trap: {trap} | UA: {ua}\n")
