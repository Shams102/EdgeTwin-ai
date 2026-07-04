package com.edgetwin.machine;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<List<MachineDto>> getAllMachines() {
        return ResponseEntity.ok(machineService.getAllMachines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MachineDto> getMachine(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getMachineDtoById(id));
    }
}
