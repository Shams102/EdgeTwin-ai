package com.edgetwin.alert;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByMachineIdOrderByTriggeredAtDesc(Long machineId);

    List<Alert> findBySeverityOrderByTriggeredAtDesc(AlertSeverity severity, Pageable pageable);

    List<Alert> findAllByOrderByTriggeredAtDesc(Pageable pageable);

    List<Alert> findByMachineIdOrderByTriggeredAtDesc(Long machineId, Pageable pageable);
}
