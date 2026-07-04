package com.edgetwin.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClientRequestException;

import java.time.Instant;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");
        return buildResponse(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<ApiErrorResponse> handleWebClientResponse(WebClientResponseException ex) {
        log.error("AI service error: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
        return buildResponse(HttpStatus.BAD_GATEWAY, "AI service returned an error");
    }

    @ExceptionHandler(WebClientRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleWebClientRequest(WebClientRequestException ex) {
        log.error("AI service unreachable: {}", ex.getMessage());
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, "AI service is not reachable");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String message) {
        ApiErrorResponse error = ApiErrorResponse.builder()
                .status(status.value())
                .message(message)
                .timestamp(Instant.now())
                .build();
        return new ResponseEntity<>(error, status);
    }
}
