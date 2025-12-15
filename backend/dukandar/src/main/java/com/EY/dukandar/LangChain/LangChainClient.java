package com.EY.dukandar.LangChain;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class LangChainClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String AGENT_URL = "http://localhost:8000/query";

    public Map<String, Object> sendToAgent(
            String context,
            String message,
            List<?> lastProducts
    ) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("context", context);
        payload.put("message", message);
        payload.put("lastProducts", lastProducts);

        return restTemplate.postForObject(
                AGENT_URL,
                payload,
                Map.class
        );
    }
}
