import json
from pathlib import Path

BANNED_IPS_PATH = Path("banned_ips.json")
IP_METADATA_PATH = Path("ip_metadata.json")

def is_ip_banned(ip: str) -> bool:
    if not BANNED_IPS_PATH.exists():
        return False
    with open(BANNED_IPS_PATH) as f:
        return ip in json.load(f)

def ban_ip(ip: str):
    banned = []
    if BANNED_IPS_PATH.exists():
        banned = json.load(open(BANNED_IPS_PATH))
    if ip not in banned:
        banned.append(ip)
        json.dump(banned, open(BANNED_IPS_PATH, "w"))

def log_ip_metadata(ip: str, metadata: dict):
    data = {}
    if IP_METADATA_PATH.exists():
        data = json.load(open(IP_METADATA_PATH))
    data[ip] = metadata
    json.dump(data, open(IP_METADATA_PATH, "w"), indent=4)

