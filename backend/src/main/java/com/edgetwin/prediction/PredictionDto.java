package com.edgetwin.prediction;

import lombok.*;

import java.time.Instant;

/**
 * Public-facing DTO served to React (camelCase, no @JsonProperty needed).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionDto {
    private Long id;
    private Long machineId;
    private Double temperature;
    private Double vibration;
    private Double pressure;
    private Double rpm;
    private Double failureProbability;
    private Double healthScore;
    private String riskLevel;
    private String recommendation;
    private Instant predictedAt;
}
