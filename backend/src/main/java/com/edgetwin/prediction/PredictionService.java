package com.edgetwin.prediction;

import com.edgetwin.alert.AlertService;
import com.edgetwin.edgeai.EdgeAiClient;
import com.edgetwin.machine.MachineService;
import com.edgetwin.machine.MachineStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final EdgeAiClient edgeAiClient;
    private final MachineService machineService;
    private final AlertService alertService;

    /**
     * Run a prediction for a machine using sensor data.
     * Calls EdgeAiClient (mock or real FastAPI), persists result,
     * generates alerts if needed, and updates machine status.
     */
    @Transactional
    public PredictionDto predict(Long machineId, PredictionRequest request) {
        // Ensure machine exists
        machineService.getMachineById(machineId);

        // Set machine ID on request
        request.setMachineId(machineId);

        // Call AI service (mock or real — transparent via interface)
        log.info("Requesting prediction for machine {}", machineId);
        PredictionResponse response = edgeAiClient.predict(request);
        log.info("Prediction received: failureProb={}, riskLevel={}",
                response.getFailureProbability(), response.getRiskLevel());

        // Persist prediction
        Prediction prediction = Prediction.builder()
                .machineId(machineId)
                .temperature(request.getTemperature())
                .vibration(request.getVibration())
                .pressure(request.getPressure())
                .rpm(request.getRpm())
                .failureProbability(response.getFailureProbability())
                .healthScore(response.getHealthScore())
                .riskLevel(response.getRiskLevel())
                .recommendation(response.getRecommendation())
                .predictedAt(response.getPredictedAt() != null ? response.getPredictedAt() : Instant.now())
                .build();

        prediction = predictionRepository.save(prediction);

        // Generate alert if failure probability exceeds thresholds
        if (response.getFailureProbability() >= 0.7) {
            alertService.createAlert(machineId, "CRITICAL",
                    "Failure probability at " + Math.round(response.getFailureProbability() * 100)
                            + "%. " + response.getRecommendation());
            machineService.updateStatus(machineId, MachineStatus.CRITICAL);
        } else if (response.getFailureProbability() >= 0.4) {
            alertService.createAlert(machineId, "WARNING",
                    "Failure probability rising (" + Math.round(response.getFailureProbability() * 100)
                            + "%). Monitor closely.");
            machineService.updateStatus(machineId, MachineStatus.WARNING);
        } else {
            machineService.updateStatus(machineId, MachineStatus.RUNNING);
        }

        return toDto(prediction);
    }

    public List<PredictionDto> getPredictionHistory(Long machineId, int limit) {
        return predictionRepository
                .findByMachineIdOrderByPredictedAtDesc(machineId, PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    public PredictionDto getLatestPrediction(Long machineId) {
        return predictionRepository
                .findTopByMachineIdOrderByPredictedAtDesc(machineId)
                .map(this::toDto)
                .orElse(null);
    }

    private PredictionDto toDto(Prediction p) {
        return PredictionDto.builder()
                .id(p.getId())
                .machineId(p.getMachineId())
                .temperature(p.getTemperature())
                .vibration(p.getVibration())
                .pressure(p.getPressure())
                .rpm(p.getRpm())
                .failureProbability(p.getFailureProbability())
                .healthScore(p.getHealthScore())
                .riskLevel(p.getRiskLevel())
                .recommendation(p.getRecommendation())
                .predictedAt(p.getPredictedAt())
                .build();
    }
}
