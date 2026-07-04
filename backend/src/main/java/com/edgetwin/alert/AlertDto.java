package com.edgetwin.alert;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDto {
    private Long id;
    private Long machineId;
    private String machineName;
    private String severity;
    private String message;
    private Instant triggeredAt;
}
