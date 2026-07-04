package com.edgetwin.edgeai;

import com.edgetwin.prediction.PredictionRequest;
import com.edgetwin.prediction.PredictionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClientRequestException;

import java.time.Duration;

/**
 * Real FastAPI implementation of EdgeAiClient.
 * Uses WebClient to call POST /predict on the FastAPI Edge AI service.
 * Active only when edge-ai.enabled=true.
 */
@Slf4j
public class FastApiEdgeAiClient implements EdgeAiClient {

    private final WebClient webClient;
    private final int timeout;

    public FastApiEdgeAiClient(WebClient.Builder builder, EdgeAiProperties properties) {
        this.webClient = builder
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.timeout = properties.getTimeout();
        log.info("FastAPI EdgeAiClient initialized with base URL: {}", properties.getBaseUrl());
    }

    @Override
    public PredictionResponse predict(PredictionRequest request) {
        log.info("Calling FastAPI /predict for machine {}", request.getMachineId());

        try {
            PredictionResponse response = webClient.post()
                    .uri("/predict")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(PredictionResponse.class)
                    .timeout(Duration.ofMillis(timeout))
                    .block();

            log.info("FastAPI response received: failureProb={}, risk={}",
                    response != null ? response.getFailureProbability() : "null",
                    response != null ? response.getRiskLevel() : "null");

            return response;

        } catch (WebClientResponseException e) {
            log.error("FastAPI returned error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI service returned error: " + e.getStatusCode(), e);
        } catch (WebClientRequestException e) {
            log.error("Cannot reach FastAPI service: {}", e.getMessage());
            throw new RuntimeException("AI service is not reachable", e);
        } catch (Exception e) {
            log.error("Unexpected error calling FastAPI: {}", e.getMessage());
            throw new RuntimeException("AI prediction failed", e);
        }
    }
}
