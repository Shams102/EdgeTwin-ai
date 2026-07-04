package com.edgetwin.edgeai;

import com.edgetwin.prediction.PredictionRequest;
import com.edgetwin.prediction.PredictionResponse;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;

/**
 * Mock implementation of EdgeAiClient.
 * Returns realistic, sensor-aware predictions without any network call.
 * Used when edge-ai.enabled=false (default for local development).
 */
@Slf4j
public class MockEdgeAiClient implements EdgeAiClient {

    @Override
    public PredictionResponse predict(PredictionRequest request) {
        log.info("[MOCK] Generating prediction for machine {}", request.getMachineId());

        double temp = safeValue(request.getTemperature(), 70.0);
        double vib = safeValue(request.getVibration(), 0.02);
        double pressure = safeValue(request.getPressure(), 30.0);
        double rpm = safeValue(request.getRpm(), 1500.0);

        // Calculate failure probability from sensor values
        // Higher temp + higher vibration + higher pressure + extreme RPM → higher risk
        double tempFactor = clamp((temp - 60.0) / 40.0, 0.0, 1.0);        // 60-100 range
        double vibFactor = clamp((vib - 0.01) / 0.07, 0.0, 1.0);          // 0.01-0.08 range
        double pressureFactor = clamp((pressure - 25.0) / 20.0, 0.0, 1.0); // 25-45 range
        double rpmFactor = clamp(Math.abs(rpm - 1400.0) / 600.0, 0.0, 1.0);// deviation from ideal

        double failureProbability = (tempFactor * 0.35)
                + (vibFactor * 0.30)
                + (pressureFactor * 0.20)
                + (rpmFactor * 0.15);

        // Add slight randomness for realistic variation (±3%)
        failureProbability += (Math.random() - 0.5) * 0.06;
        failureProbability = clamp(failureProbability, 0.01, 0.99);

        // Round to 2 decimal places
        failureProbability = Math.round(failureProbability * 100.0) / 100.0;

        double healthScore = Math.round((1.0 - failureProbability) * 100.0 * 10.0) / 10.0;

        String riskLevel = determineRiskLevel(failureProbability);
        String recommendation = generateRecommendation(failureProbability, temp, vib);

        log.info("[MOCK] Result: failureProb={}, healthScore={}, risk={}",
                failureProbability, healthScore, riskLevel);

        return PredictionResponse.builder()
                .machineId(request.getMachineId())
                .failureProbability(failureProbability)
                .healthScore(healthScore)
                .riskLevel(riskLevel)
                .recommendation(recommendation)
                .predictedAt(Instant.now())
                .build();
    }

    private String determineRiskLevel(double prob) {
        if (prob >= 0.7) return "CRITICAL";
        if (prob >= 0.5) return "HIGH";
        if (prob >= 0.3) return "MEDIUM";
        return "LOW";
    }

    private String generateRecommendation(double prob, double temp, double vibration) {
        if (prob >= 0.7) {
            return "URGENT: Schedule immediate maintenance. High failure risk detected.";
        }
        if (vibration > 0.05) {
            return "Vibration levels elevated. Inspect bearings and alignment.";
        }
        if (temp > 90) {
            return "Temperature above safe threshold. Check cooling system.";
        }
        if (prob >= 0.4) {
            return "Monitor closely. Schedule preventive maintenance within 1 week.";
        }
        return "All systems nominal. Continue regular maintenance schedule.";
    }

    private double safeValue(Double value, double defaultValue) {
        return value != null ? value : defaultValue;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
