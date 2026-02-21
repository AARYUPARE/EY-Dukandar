package com.EY.dukandar.Model;

public class LoginResponse {

    private String message;
    private User user;
    private String storeType;
    private Store store;
    private Object availableWishlist;

    private String agentResponse;

    public String getAgentResponse() {
        return agentResponse;
    }

    public void setAgentResponse(String agentResponse) {
        this.agentResponse = agentResponse;
    }

    public LoginResponse() {}

    public LoginResponse(String message, User user, String storeType, Store store, Object availableWishlist, String agentResponse) {
        this.message = message;
        this.user = user;
        this.storeType = storeType;
        this.store = store;
        this.availableWishlist = availableWishlist;
        this.agentResponse = agentResponse;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStoreType() { return storeType; }
    public void setStoreType(String storeType) { this.storeType = storeType; }

    public Store getStore() { return store; }
    public void setStoreId(Store store) { this.store = store; }

    public Object getAvailableWishlist() { return availableWishlist; }
    public void setAvailableWishlist(Object availableWishlist) { this.availableWishlist = availableWishlist; }
}