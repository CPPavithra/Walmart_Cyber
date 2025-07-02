# services/attack-simulator/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from ransomware_sim import simulate_ransomware

app = FastAPI()

class AttackRequest(BaseModel):
    attack_type: str

@app.post("/simulate-attack")
async def simulate_attack(req: AttackRequest):
    if req.attack_type == "ransomware":
        result = simulate_ransomware()
        return result
    return {"status": "ignored", "reason": "unknown attack type"}
