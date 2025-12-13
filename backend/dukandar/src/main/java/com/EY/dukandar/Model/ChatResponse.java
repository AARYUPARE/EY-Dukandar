package com.EY.dukandar.Model;

import com.EY.dukandar.Model.Product;
import java.util.List;

public class ChatResponse {

    private String sessionId;     // same session id from request
    private String reply;         // agent textual message
    private List<Product> products;  // recommended products (optional)

    public ChatResponse() {}

    public ChatResponse(String sessionId, String reply, List<Product> products) {
        this.sessionId = sessionId;
        this.reply = reply;
        this.products = products;
    }

    // Getters & Setters
    public String getSessionId() {
        return sessionId;
    }
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getReply() {
        return reply;
    }
    public void setReply(String reply) {
        this.reply = reply;
    }

    public List<Product> getProducts() {
        return products;
    }
    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
