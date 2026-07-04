package com.edgetwin.prediction;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "machine_id", nullable = false)
    private Long machineId;

    private Double temperature;
    private Double vibration;
    private Double pressure;
    private Double rpm;

    @Column(name = "failure_probability", nullable = false)
    private Double failureProbability;

    @Column(name = "health_score", nullable = false)
    private Double healthScore;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;

    @Column(length = 500)
    private String recommendation;

    @Column(name = "predicted_at", nullable = false)
    private Instant predictedAt;
}
