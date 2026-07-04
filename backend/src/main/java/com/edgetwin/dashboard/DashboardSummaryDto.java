package com.edgetwin.dashboard;

import com.edgetwin.alert.AlertDto;
import com.edgetwin.machine.MachineDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private int totalMachines;
    private int running;
    private int warning;
    private int critical;
    private List<MachineDto> machines;
    private List<AlertDto> recentAlerts;
}
