package com.EY.dukandar.Model;

import com.EY.dukandar.Model.Product;
import java.util.List;

public class ChatResponse {

    private String sessionId;     // same session id from request
    private String reply;         // agent textual message
    private List<Product> products;  // recommended products (optional)
    private List<Store> stores;  // recommended products (optional)
    private String user_lang;

    public ChatResponse() {}

    public ChatResponse(String sessionId, String reply, List<Product> products, List<Store> stores, String user_lang) {
        this.sessionId = sessionId;
        this.reply = reply;
        this.products = products;
        this.stores = stores;
        this.user_lang = user_lang;
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
    public List<Store> getStores() {
        return stores;
    }
    public void setStores(List<Store> stores) {
        this.stores = stores;
    }

    public String getUser_lang() {return user_lang;}
    public void setUser_lang(String user_lang){
        this.user_lang = user_lang;
    }
}
