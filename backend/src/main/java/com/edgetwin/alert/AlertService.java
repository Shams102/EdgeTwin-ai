package com.edgetwin.alert;

import com.edgetwin.machine.Machine;
import com.edgetwin.machine.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final MachineRepository machineRepository;

    public void createAlert(Long machineId, String severity, String message) {
        Alert alert = Alert.builder()
                .machineId(machineId)
                .severity(AlertSeverity.valueOf(severity))
                .message(message)
                .triggeredAt(Instant.now())
                .build();
        alertRepository.save(alert);
    }

    public List<AlertDto> getRecentAlerts(int limit) {
        return alertRepository.findAllByOrderByTriggeredAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<AlertDto> getAlertsByMachine(Long machineId, int limit) {
        return alertRepository.findByMachineIdOrderByTriggeredAtDesc(machineId, PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<AlertDto> getAlertsBySeverity(String severity, int limit) {
        return alertRepository.findBySeverityOrderByTriggeredAtDesc(
                        AlertSeverity.valueOf(severity), PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    private AlertDto toDto(Alert alert) {
        String machineName = machineRepository.findById(alert.getMachineId())
                .map(Machine::getName)
                .orElse("Unknown");

        return AlertDto.builder()
                .id(alert.getId())
                .machineId(alert.getMachineId())
                .machineName(machineName)
                .severity(alert.getSeverity().name())
                .message(alert.getMessage())
                .triggeredAt(alert.getTriggeredAt())
                .build();
    }
}
