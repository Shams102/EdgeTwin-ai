"""
EdgeTwin AI — FastAPI Edge AI Service
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import PredictionRequest, PredictionResponse, HealthResponse
from . import predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    logger.info("Starting Edge AI service...")
    try:
        predictor.load_model()
        logger.info("Model loaded successfully")
    except FileNotFoundError as e:
        logger.error(f"Failed to load model: {e}")
        # Don't crash — health endpoint will report model_loaded=false
    yield
    logger.info("Shutting down Edge AI service")


app = FastAPI(
    title="EdgeTwin Edge AI Service",
    description="Predictive Maintenance AI — RandomForest inference",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS not strictly needed (only Spring Boot calls us), but useful for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Docker and Spring Boot HealthIndicator."""
    return HealthResponse(
        status="ok",
        model_loaded=predictor.is_model_loaded(),
        model_version=settings.model_version,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Run prediction on sensor readings.
    Called by Spring Boot's FastApiEdgeAiClient via WebClient.
    """
    if not predictor.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Service is not ready."
        )

    try:
        result = predictor.predict(request)
        logger.info(
            f"Prediction for machine {request.machine_id}: "
            f"failure_prob={result.failure_probability}, "
            f"risk={result.risk_level}"
        )
        return result
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
