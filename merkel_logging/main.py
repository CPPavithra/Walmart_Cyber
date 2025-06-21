from fastapi import FastAPI, Request, WebSocket
from fingerprint import generate_fingerprint
from logger import create_log_entry, append_to_log, get_last_hash, load_logs
from clustering import get_clusters
from websocket import broadcast_log, clients
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestData(BaseModel):
    ip: str
    headers: dict
    clicks: int

@app.post("/fingerprint")
async def fingerprint(data: RequestData):
    fp = generate_fingerprint(data.ip, data.headers, data.clicks)
    prediction = "bot" if data.clicks > 50 else "human"
    log = create_log_entry(fp, prediction, get_last_hash())
    append_to_log(log)
    await broadcast_log(log)  # WebSocket broadcast
    return {"fingerprint": fp, "prediction": prediction, "log": log}

@app.get("/logs")
async def get_logs():
    return load_logs()

@app.get("/clusters")
async def clusters():
    return get_clusters()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await asyncio.sleep(10)
    except:
        clients.remove(websocket)
