# backend/fraud_detection/routes.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import numpy as np
from joblib import load
import asyncio

router = APIRouter()

# Load models
xgb_model = load("ensemble_model/xgb_model.joblib")
rf_model = load("ensemble_model/rf_model.joblib")
scaler = load("ensemble_model/scaler.joblib")

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

connected_clients = []

@router.post("/analyze")
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
        **data.dict(),
        "prediction": "bot" if ensemble_pred == 1 else "human",
        "xgb_pred": int(xgb_pred),
        "rf_pred": int(rf_pred)
    }
    await broadcast_json(result)
    return result

@router.websocket("/ws-fraud")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

async def broadcast_json(message: dict):
    for client in connected_clients:
        try:
            await client.send_json(message)
        except:
            connected_clients.remove(client)
