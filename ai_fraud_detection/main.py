from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from joblib import load
import numpy as np
import asyncio

# Initialize FastAPI
app = FastAPI()

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load models
xgb_model = load("ensemble_model/xgb_model.joblib")
rf_model = load("ensemble_model/rf_model.joblib")
scaler = load("ensemble_model/scaler.joblib")

# WebSocket manager
connected_clients = []

# Data model
class Activity(BaseModel):
    session_id: str
    clicks_per_session: float
    session_duration: float
    time_between_requests: float
    ua_entropy: float
    referer_entropy: float
    click_rate: float
    suspicious_ua: int
    cookies_enabled: int
    time_of_day: int
    request_path_depth: float
    num_unique_pages: float
    repeated_paths_ratio: float

@app.post("/analyze")
async def analyze_user(data: Activity):
    features = np.array([[
        data.clicks_per_session,
        data.session_duration,
        data.time_between_requests,
        data.ua_entropy,
        data.referer_entropy,
        data.click_rate,
        data.suspicious_ua,
        data.cookies_enabled,
        data.time_of_day,
        data.request_path_depth,
        data.num_unique_pages,
        data.repeated_paths_ratio
    ]])

    scaled = scaler.transform(features)
    xgb_pred = xgb_model.predict(scaled)[0]
    rf_pred = rf_model.predict(scaled)[0]
    ensemble_pred = int(xgb_pred or rf_pred)


    result = {
        **data.model_dump(),  # includes all input fields!
        "prediction": "bot" if ensemble_pred == 1 else "human",
        "xgb_pred": int(xgb_pred),
        "rf_pred": int(rf_pred)
    }
    await broadcast_json(result)
    return result

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # keeps connection open
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

async def broadcast_json(message: dict):
    for client in connected_clients:
        try:
            await client.send_json(message)
        except:
            pass  # skip disconnected clients

