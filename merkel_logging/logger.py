import hashlib, json, os
from datetime import datetime

def get_last_hash():
    logs = load_logs()
    return logs[-1]['current_hash'] if logs else "0"*64

def create_log_entry(fingerprint, prediction, prev_hash):
    log = {
        "timestamp": datetime.utcnow().isoformat(),
        "fingerprint": fingerprint,
        "prediction": prediction,
        "prev_hash": prev_hash
    }
    log_str = json.dumps(log, sort_keys=True)
    log["current_hash"] = hashlib.sha256((log_str + prev_hash).encode()).hexdigest()
    return log

def append_to_log(entry):
    logs = load_logs()
    logs.append(entry)
    with open("db.json", "w") as f:
        json.dump(logs, f, indent=2)

def load_logs():
    try:
        if os.path.exists("db.json"):
            with open("db.json") as f:
                return json.load(f)
    except:
        return []
    return []

