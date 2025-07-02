# train_ensemble_model.py

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb

# === Load your data ===
# Replace 'your_data.csv' with your actual CSV file name
df = pd.read_csv("grinch_bot_logs_extended.csv")

# === Feature selection ===
features = [
    "clicks_per_session", "session_duration", "time_between_requests",
    "ua_entropy", "referer_entropy", "click_rate", "suspicious_ua",
    "cookies_enabled", "time_of_day",  # <--- make sure this is added
    "request_path_depth", "num_unique_pages", "repeated_paths_ratio"
]
target = "is_bot"

X = df[features]
y = df[target]

# === Train-test split ===
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# === Scale features ===
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
X_all_scaled = scaler.transform(X)

# === XGBoost ===
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric='logloss',
    random_state=42
)
xgb_model.fit(X_train_scaled, y_train)
xgb_test_preds = xgb_model.predict(X_test_scaled)

print("🎯 XGBoost Model Report")
print(confusion_matrix(y_test, xgb_test_preds))
print(classification_report(y_test, xgb_test_preds))

# === Random Forest ===
rf_model = RandomForestClassifier(n_estimators=200, random_state=42)
rf_model.fit(X_train_scaled, y_train)
rf_test_preds = rf_model.predict(X_test_scaled)

print("🌲 Random Forest Report")
print(confusion_matrix(y_test, rf_test_preds))
print(classification_report(y_test, rf_test_preds))

# === Ensemble Predictions ===
xgb_all_preds = xgb_model.predict(X_all_scaled)
rf_all_preds = rf_model.predict(X_all_scaled)
ensemble_preds = np.logical_or(xgb_all_preds, rf_all_preds).astype(int)

print("🤖 Ensemble (Union) Report")
print(confusion_matrix(y, ensemble_preds))
print(classification_report(y, ensemble_preds))

# === Save models ===
os.makedirs("ensemble_model", exist_ok=True)
joblib.dump(xgb_model, "ensemble_model/xgb_model.joblib")
joblib.dump(rf_model, "ensemble_model/rf_model.joblib")
joblib.dump(scaler, "ensemble_model/scaler.joblib")

print("✅ Ensemble models saved to `ensemble_model/`")

