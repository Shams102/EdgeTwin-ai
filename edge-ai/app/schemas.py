"""
IMMUTABLE API CONTRACTS — Pydantic schemas.

These schemas MUST match the Java DTOs:
  - PredictionRequest  → backend/.../prediction/PredictionRequest.java
  - PredictionResponse → backend/.../prediction/PredictionResponse.java

DO NOT rename fields without updating both sides.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class PredictionRequest(BaseModel):
    """Sensor readings from Spring Boot for a single machine."""

    machine_id: int = Field(..., description="ID of the machine")
    temperature: float = Field(..., ge=0, le=200, description="Temperature in °C")
    vibration: float = Field(..., ge=0, le=1, description="Vibration in mm/s")
    pressure: float = Field(..., ge=0, le=100, description="Pressure in PSI")
    rpm: float = Field(..., ge=0, le=5000, description="Rotations per minute")


class PredictionResponse(BaseModel):
    """AI prediction result returned to Spring Boot."""

    machine_id: int
    failure_probability: float = Field(..., ge=0, le=1)
    health_score: float = Field(..., ge=0, le=100)
    risk_level: str = Field(..., pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    recommendation: str
    predicted_at: datetime


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    model_loaded: bool = False
    model_version: str = ""
