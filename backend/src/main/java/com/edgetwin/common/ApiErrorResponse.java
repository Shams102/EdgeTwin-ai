package com.edgetwin.common;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiErrorResponse {
    private int status;
    private String message;
    private Instant timestamp;
}
