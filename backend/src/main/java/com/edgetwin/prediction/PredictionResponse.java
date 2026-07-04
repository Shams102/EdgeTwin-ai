package com.edgetwin.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;

/**
 * IMMUTABLE CONTRACT — received FROM FastAPI (POST /predict response).
 * Field names use snake_case via @JsonProperty to match Pydantic schema.
 * DO NOT rename fields without updating FastAPI schemas.py.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResponse {

    @JsonProperty("machine_id")
    private Long machineId;

    @JsonProperty("failure_probability")
    private Double failureProbability;

    @JsonProperty("health_score")
    private Double healthScore;

    @JsonProperty("risk_level")
    private String riskLevel;

    private String recommendation;

    @JsonProperty("predicted_at")
    private Instant predictedAt;
}
