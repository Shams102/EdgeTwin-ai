package com.edgetwin.edgeai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class EdgeAiConfig {

    @Bean
    @ConditionalOnProperty(name = "edge-ai.enabled", havingValue = "true")
    public EdgeAiClient fastApiEdgeAiClient(WebClient.Builder builder,
                                             EdgeAiProperties properties) {
        return new FastApiEdgeAiClient(builder, properties);
    }

    @Bean
    @ConditionalOnProperty(name = "edge-ai.enabled", havingValue = "false",
                           matchIfMissing = true)
    public EdgeAiClient mockEdgeAiClient() {
        return new MockEdgeAiClient();
    }
}
