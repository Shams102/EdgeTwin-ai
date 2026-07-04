package com.edgetwin.machine;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineDto {
    private Long id;
    private String name;
    private String location;
    private String status;
    private Double healthScore;
}
