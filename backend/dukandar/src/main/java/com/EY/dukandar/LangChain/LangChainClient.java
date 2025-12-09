package com.EY.dukandar.LangChain;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LangChainClient {

    private final RestTemplate restTemplate = new RestTemplate();

    // URL of your Python backend LangChain orchestrator API
    private final String AGENT_URL = "http://localhost:5000/agent/chat";

    /**
     * Sends chat context and user message to Python LangChain agent,
     * returns the agent's response as String.
     */
    public String sendToAgent(String context, String message) {

        // Prepare JSON body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("context", context);
        requestBody.put("message", message);

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create HTTP entity with body + headers
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // Send POST request to Python API
        ResponseEntity<String> response = restTemplate.exchange(
                AGENT_URL,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        // Return the response body (chatbot reply)
        return response.getBody();
    }
}
