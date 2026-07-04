package com.edgetwin.edgeai;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "edge-ai")
@Getter
@Setter
public class EdgeAiProperties {

    /**
     * Whether to use the real FastAPI service (true) or mock (false).
     */
    private boolean enabled = false;

    /**
     * Base URL of the FastAPI Edge AI service.
     */
    private String baseUrl = "http://localhost:8000";

    /**
     * Timeout in milliseconds for FastAPI calls.
     */
    private int timeout = 5000;
}
