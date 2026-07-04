package com.edgetwin.edgeai;

import com.edgetwin.prediction.PredictionRequest;
import com.edgetwin.prediction.PredictionResponse;

/**
 * EdgeAiClient interface — the core abstraction for AI predictions.
 *
 * Two implementations:
 * - MockEdgeAiClient: returns realistic predictions without any network call
 * - FastApiEdgeAiClient: calls the real FastAPI service via WebClient
 *
 * The rest of the application NEVER knows which implementation is active.
 * Switching is controlled by edge-ai.enabled in application.yml.
 */
public interface EdgeAiClient {

    PredictionResponse predict(PredictionRequest request);
}
