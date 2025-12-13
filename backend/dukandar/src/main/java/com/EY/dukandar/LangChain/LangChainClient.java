package com.EY.dukandar.LangChain;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Component
public class LangChainClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_SERVER_URL = "http://localhost:8000/query";

    public Map<String, Object> sendToAgent(String context, String message) {

        Map<String, String> payload = new HashMap<>();
        payload.put("context", context);
        payload.put("query", message);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                PYTHON_SERVER_URL,
                HttpMethod.POST,
                entity,
                Map.class
        );

        return response.getBody();
    }
}
