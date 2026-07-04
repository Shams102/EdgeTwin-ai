"""
Predictor module — loads model.pkl and runs inference.
"""

import joblib
import numpy as np
import logging
from datetime import datetime, timezone
from pathlib import Path

from .config import settings
from .schemas import PredictionRequest, PredictionResponse

logger = logging.getLogger(__name__)

# Global model reference
_model = None
_model_loaded = False


def load_model():
    """Load the trained RandomForest model from disk."""
    global _model, _model_loaded

    model_path = Path(settings.model_path)
    if not model_path.exists():
        logger.error(f"Model file not found at {model_path}")
        raise FileNotFoundError(f"Model file not found: {model_path}")

    _model = joblib.load(model_path)
    _model_loaded = True
    logger.info(f"Model loaded from {model_path}")


def is_model_loaded() -> bool:
    return _model_loaded


def predict(request: PredictionRequest) -> PredictionResponse:
    """
    Run prediction using the loaded model.

    Features: [temperature, vibration, pressure, rpm]
    Model output: predict_proba → probability of failure (class 1)
    """
    if not _model_loaded or _model is None:
        raise RuntimeError("Model is not loaded")

    # Prepare feature vector
    features = np.array([[
        request.temperature,
        request.vibration,
        request.pressure,
        request.rpm
    ]])

    # Get failure probability from model
    probabilities = _model.predict_proba(features)
    failure_probability = round(float(probabilities[0][1]), 2)

    # Calculate health score
    health_score = round((1.0 - failure_probability) * 100.0, 1)

    # Determine risk level
    risk_level = _determine_risk_level(failure_probability)

    # Generate recommendation
    recommendation = _generate_recommendation(
        failure_probability,
        request.temperature,
        request.vibration
    )

    return PredictionResponse(
        machine_id=request.machine_id,
        failure_probability=failure_probability,
        health_score=health_score,
        risk_level=risk_level,
        recommendation=recommendation,
        predicted_at=datetime.now(timezone.utc)
    )


def _determine_risk_level(prob: float) -> str:
    if prob >= 0.7:
        return "CRITICAL"
    elif prob >= 0.5:
        return "HIGH"
    elif prob >= 0.3:
        return "MEDIUM"
    return "LOW"


def _generate_recommendation(prob: float, temp: float, vibration: float) -> str:
    if prob >= 0.7:
        return "URGENT: Schedule immediate maintenance. High failure risk detected."
    if vibration > 0.05:
        return "Vibration levels elevated. Inspect bearings and alignment."
    if temp > 90:
        return "Temperature above safe threshold. Check cooling system."
    if prob >= 0.4:
        return "Monitor closely. Schedule preventive maintenance within 1 week."
    return "All systems nominal. Continue regular maintenance schedule."
