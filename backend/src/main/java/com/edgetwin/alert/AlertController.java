package com.edgetwin.alert;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertDto>> getAlerts(
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "20") int limit) {
        if (severity != null && !severity.isEmpty()) {
            return ResponseEntity.ok(alertService.getAlertsBySeverity(severity, limit));
        }
        return ResponseEntity.ok(alertService.getRecentAlerts(limit));
    }

    @GetMapping("/machine/{machineId}")
    public ResponseEntity<List<AlertDto>> getAlertsByMachine(
            @PathVariable Long machineId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(alertService.getAlertsByMachine(machineId, limit));
    }
}
