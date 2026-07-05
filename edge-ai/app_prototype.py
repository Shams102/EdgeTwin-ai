import os
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator


class PredictionRequest(BaseModel):
    airTemp: float
    processTemp: float
    rpm: float
    torque: float
    toolWear: float
    type: Optional[str] = "M"

    @validator("type", pre=True, always=True)
    def normalize_type(cls, value):
        if value is None:
            return "M"
        normalized = str(value).upper().strip()
        if normalized not in {"L", "M", "H"}:
            return "M"
        return normalized


class PredictionResponse(BaseModel):
    failureProbability: float
    healthScore: int
    failureType: str
    recommendation: str


app = FastAPI(
    title="EdgeTwin AI Edge Service",
    description="FastAPI service for local edge inference using the trained AI4I predictive maintenance model.",
    version="0.1.0",
)

MODEL_PATH = os.path.join("model", "model.pkl")
model = None


def load_model() -> None:
    global model
    if model is not None:
        return
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at {MODEL_PATH}. Run train.py first.")
    model = joblib.load(MODEL_PATH)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "modelLoaded": model is not None}


def build_prediction_payload(payload: PredictionRequest) -> pd.DataFrame:
    row = {
        "Air temperature [K]": payload.airTemp,
        "Process temperature [K]": payload.processTemp,
        "Rotational speed [rpm]": payload.rpm,
        "Torque [Nm]": payload.torque,
        "Tool wear [min]": payload.toolWear,
        "Type": payload.type,
    }
    return pd.DataFrame([row])


def build_response(failure_probability: float) -> dict:
    failure_probability = float(max(0.0, min(1.0, failure_probability)))
    health_score = int(round(max(0, min(100, 100 - failure_probability * 100))))

    if failure_probability < 0.1:
        failure_type = "Healthy"
        recommendation = "Continue Monitoring"
    elif failure_probability < 0.33:
        failure_type = "At Risk"
        recommendation = "Inspect machine within 48 hours"
    elif failure_probability < 0.66:
        failure_type = "Maintenance Recommended"
        recommendation = "Schedule maintenance soon"
    else:
        failure_type = "Failure Imminent"
        recommendation = "Immediate maintenance required"

    return {
        "failureProbability": round(failure_probability, 4),
        "healthScore": health_score,
        "failureType": failure_type,
        "recommendation": recommendation,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    if model is None:
        load_model()

    try:
        input_df = build_prediction_payload(payload)
        probabilities = model.predict_proba(input_df)
        failure_probability = float(probabilities[0, 1])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {exc}")

    response_data = build_response(failure_probability)
    return PredictionResponse(**response_data)


# Load the model at import time for service readiness.
load_model()
