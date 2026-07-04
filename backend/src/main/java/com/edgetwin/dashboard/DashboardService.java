package com.edgetwin.dashboard;

import com.edgetwin.alert.AlertDto;
import com.edgetwin.alert.AlertService;
import com.edgetwin.machine.MachineDto;
import com.edgetwin.machine.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MachineService machineService;
    private final AlertService alertService;

    public DashboardSummaryDto getSummary() {
        List<MachineDto> machines = machineService.getAllMachines();
        List<AlertDto> recentAlerts = alertService.getRecentAlerts(10);

        int running = 0, warning = 0, critical = 0;
        for (MachineDto m : machines) {
            switch (m.getStatus()) {
                case "RUNNING" -> running++;
                case "WARNING" -> warning++;
                case "CRITICAL" -> critical++;
            }
        }

        return DashboardSummaryDto.builder()
                .totalMachines(machines.size())
                .running(running)
                .warning(warning)
                .critical(critical)
                .machines(machines)
                .recentAlerts(recentAlerts)
                .build();
    }
}
