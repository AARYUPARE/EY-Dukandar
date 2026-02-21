package com.EY.dukandar.LangChain;

import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Model.Store;
import com.EY.dukandar.Model.User;
import com.EY.dukandar.Service.ProductService;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class LangChainClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String AGENT_URL = "http://localhost:8000/query";
    private static final String LOGIN_EVENT_URL = "http://localhost:8000/login-event";
    private static final String PAYMENT_SUCCESS_EVENT = "http://localhost:8000/content.strip()";
    private final String RESERVE_DETAIL_API = "http://localhost:8000/qr-scan";

    private final ProductService productService;

    public LangChainClient(ProductService productService) {
        this.productService = productService;
    }

    public Map<String, Object> sendToAgent(
            String sessionId,
            String message,
            User user
    ) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", sessionId);
        payload.put("message", message);
        payload.put("user", user); // 🔥 FULL USER

        return restTemplate.postForObject(
                AGENT_URL,
                payload,
                Map.class
        );
    }


    public Map<String, Object> sendLoginEvent(
            String sessionId,
            String channel,
            User user,
            Store store
    ) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", sessionId);
        payload.put("channel", channel);
        payload.put("user", user);
        payload.put("store", store);

        return restTemplate.postForObject(
                LOGIN_EVENT_URL,
                payload,
                Map.class
        );
    }

    public void sendPaymentSuccessEvent()
    {
        restTemplate.postForObject(
                PAYMENT_SUCCESS_EVENT, null, Map.class
        );
    }


    public Map<String, Object> authDetail(Long productId, Long userId)
    {
        Product product = productService.getProductById(productId);

        System.out.println(product);

        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", userId.toString());
        payload.put("product", product);

        System.out.println("go for scan");

        return restTemplate.postForObject(
                RESERVE_DETAIL_API,
                payload,
                Map.class
        );
    }
}

