package com.edgetwin.prediction;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    List<Prediction> findByMachineIdOrderByPredictedAtDesc(Long machineId, Pageable pageable);

    Optional<Prediction> findTopByMachineIdOrderByPredictedAtDesc(Long machineId);

    List<Prediction> findByMachineIdOrderByPredictedAtDesc(Long machineId);
}
