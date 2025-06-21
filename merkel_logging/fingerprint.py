import hashlib
from datetime import datetime
import numpy as np

def entropy(ip):
    return -sum([p*np.log2(p) for p in np.bincount([int(x) for x in ip.split('.')]) if p > 0])

def get_behavior_vector(clicks):
    tod = datetime.now().hour
    return f"{clicks}_{tod}"

def generate_fingerprint(ip, headers, clicks):
    traits = [
        str(round(entropy(ip), 2)),
        hashlib.sha256(''.join([headers.get(h, '') for h in ['user-agent', 'accept']]).encode()).hexdigest(),
        get_behavior_vector(clicks)
    ]
    return hashlib.sha256('|'.join(traits).encode()).hexdigest()
