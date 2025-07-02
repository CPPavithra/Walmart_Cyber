# services/attack-simulator/ransomware_sim.py
import os
import time
from kubernetes import client, config

def simulate_ransomware():
    start_time = time.time()

    # Simulate corruption of files
    files = ["/app/data/transactions.json", "/app/config/settings.ini"]
    for file in files:
        if os.path.exists(file):
            with open(file, 'w') as f:
                f.write("!!! ENCRYPTED BY RANSOMWARE !!!")
    
    # Load kube config (works both inside and outside cluster)
    try:
        config.load_incluster_config()
    except:
        config.load_kube_config()

    v1 = client.CoreV1Api()
    namespace = "walmart-prod"
    pod_prefix = "pos-terminal"

    # Step 1: Find the pod
    pods = v1.list_namespaced_pod(namespace=namespace)
    target_pod = next((p for p in pods.items if pod_prefix in p.metadata.name), None)
    
    if not target_pod:
        return {"status": "failed", "reason": "No target pod found"}

    pod_name = target_pod.metadata.name
    print(f"Targeting pod: {pod_name}")

    # Step 2: Delete the pod
    v1.delete_namespaced_pod(pod_name, namespace)
    print(f"Deleted {pod_name}. Waiting for replacement...")

    # Step 3: Wait for new pod
    while True:
        pods = v1.list_namespaced_pod(namespace=namespace)
        healthy_pod = next(
            (p for p in pods.items if pod_prefix in p.metadata.name and p.status.phase == "Running"), None)
        if healthy_pod:
            print(f"New pod {healthy_pod.metadata.name} is ready")
            break
        time.sleep(1)

    return {
        "status": "healed",
        "original_pod": pod_name,
        "new_pod": healthy_pod.metadata.name,
        "heal_time_sec": round(time.time() - start_time, 2)
    }
