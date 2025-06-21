import numpy as np
from sklearn.cluster import DBSCAN
from logger import load_logs

# Convert hash to int vector
def fingerprint_to_vector(fp):
    return [int(fp[i:i+16], 16) for i in range(0, len(fp), 16)]

def get_clusters():
    logs = load_logs()
    vectors = [fingerprint_to_vector(log['fingerprint']) for log in logs]
    if not vectors:
        return []
    clustering = DBSCAN(eps=1e15, min_samples=2).fit(vectors)
    clusters = {}
    for idx, label in enumerate(clustering.labels_):
        clusters.setdefault(str(label), []).append(logs[idx])
    return clusters
