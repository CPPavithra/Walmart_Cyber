from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import asyncio
from typing import List

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulation Endpoints
@app.post("/simulate/ransomware")
async def simulate_ransomware():
    try:
        # Scale down to simulate attack
        subprocess.run("kubectl scale deployment neuroretailx-service --replicas=0", shell=True, check=True)
        
        # Wait 5 seconds then scale back up (self-healing)
        asyncio.create_task(self_heal_after_delay())
        
        return {"status": "Ransomware attack simulated", "self_healing": "in_progress"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def self_heal_after_delay(delay=5):
    await asyncio.sleep(delay)
    subprocess.run("kubectl scale deployment neuroretailx-service --replicas=1", shell=True)

@app.post("/simulate/bruteforce")
async def simulate_bruteforce():
    try:
        # Get pod name
        pod_name = subprocess.getoutput(
            "kubectl get pods -l app=neuroretailx -o jsonpath='{.items[0].metadata.name}'"
        )
        
        # Run CPU stress for 10 seconds
        subprocess.Popen(
            f"kubectl exec {pod_name} -- sh -c 'timeout 10 openssl speed -seconds 10'",
            shell=True
        )
        
        return {"status": "Brute force attack running", "duration": "10s"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add this new endpoint that matches what your frontend expects
@app.get("/api/events")
async def get_events() -> List[str]:
    try:
        events = subprocess.check_output(
            "kubectl get events --sort-by=.metadata.creationTimestamp",
            shell=True
        ).decode()
        return [line for line in events.split('\n') if "neuroretailx" in line]
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=e.output.decode())

# This endpoint was using "/simulate/all" but frontend uses "/simulate/full"
@app.post("/simulate/full")
async def run_full_simulation():
    try:
        script_path = "/walmart/self_healing_viz/auto_heal_scripts/simulate_attack.sh"
        subprocess.Popen([script_path], shell=True)
        return {"status": "Running full attack simulation"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
