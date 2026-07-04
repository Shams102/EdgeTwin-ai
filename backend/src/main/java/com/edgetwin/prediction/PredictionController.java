package com.edgetwin.prediction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines/{machineId}")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    /**
     * Trigger a prediction for a machine with sensor readings.
     */
    @PostMapping("/predict")
    public ResponseEntity<PredictionDto> predict(
            @PathVariable Long machineId,
            @RequestBody PredictionRequest request) {
        return ResponseEntity.ok(predictionService.predict(machineId, request));
    }

    /**
     * Get prediction history for a machine.
     */
    @GetMapping("/predictions")
    public ResponseEntity<List<PredictionDto>> getPredictions(
            @PathVariable Long machineId,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(predictionService.getPredictionHistory(machineId, limit));
    }
}
