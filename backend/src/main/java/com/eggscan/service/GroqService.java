package com.eggscan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private final WebClient client;
    private final String model;
    private final ObjectMapper mapper = new ObjectMapper();

    public GroqService(@Qualifier("groqClient") WebClient groqClient,
                       @Value("${groq.model}") String model) {
        this.client = groqClient;
        this.model = model;
    }

    public JsonNode chatJson(String systemPrompt, String userPrompt) {
        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.7,
                "max_tokens", 1200,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        JsonNode resp = client.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        String content = resp.path("choices").path(0).path("message").path("content").asText();
        try {
            return mapper.readTree(content);
        } catch (Exception e) {
            throw new RuntimeException("Groq returned invalid JSON: " + content, e);
        }
    }
}