package com.edgetwin.machine;

import com.edgetwin.common.EntityNotFoundException;
import com.edgetwin.prediction.Prediction;
import com.edgetwin.prediction.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final PredictionRepository predictionRepository;

    public List<MachineDto> getAllMachines() {
        return machineRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public Machine getMachineById(Long id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Machine", id));
    }

    public MachineDto getMachineDtoById(Long id) {
        Machine machine = getMachineById(id);
        return toDto(machine);
    }

    public void updateStatus(Long machineId, MachineStatus status) {
        Machine machine = getMachineById(machineId);
        machine.setStatus(status);
        machineRepository.save(machine);
    }

    private MachineDto toDto(Machine machine) {
        // Get latest prediction health score for this machine
        Double healthScore = predictionRepository
                .findTopByMachineIdOrderByPredictedAtDesc(machine.getId())
                .map(Prediction::getHealthScore)
                .orElse(null);

        return MachineDto.builder()
                .id(machine.getId())
                .name(machine.getName())
                .location(machine.getLocation())
                .status(machine.getStatus().name())
                .healthScore(healthScore)
                .build();
    }
}
