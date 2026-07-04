package com.edgetwin.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * IMMUTABLE CONTRACT — sent TO FastAPI (POST /predict).
 * Field names use snake_case via @JsonProperty to match Pydantic schema.
 * DO NOT rename fields without updating FastAPI schemas.py.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionRequest {

    @JsonProperty("machine_id")
    private Long machineId;

    private Double temperature;

    private Double vibration;

    private Double pressure;

    private Double rpm;
}
