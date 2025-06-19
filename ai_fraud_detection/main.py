# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from joblib import load
import numpy as np

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
xgb_model = load("ensemble_model/xgb_model.joblib")
rf_model = load("ensemble_model/rf_model.joblib")
scaler = load("ensemble_model/scaler.joblib")

# Define input structure
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
def analyze_user(data: Activity):
    # Arrange input features
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

    # Scale
    scaled = scaler.transform(features)

    # Predict
    xgb_pred = xgb_model.predict(scaled)[0]
    rf_pred = rf_model.predict(scaled)[0]

    # Ensemble: Union
    ensemble_pred = int(xgb_pred or rf_pred)

    return {
        "session_id": data.session_id,
        "prediction": "bot" if ensemble_pred == 1 else "human",
        "xgb_pred": int(xgb_pred),
        "rf_pred": int(rf_pred)
    }

