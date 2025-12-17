package com.EY.dukandar.Model;

public class LoginResponse {

    private String message;
    private User user;
    private String storeType;
    private Long storeId;
    private Object availableWishlist;

    public LoginResponse() {}

    public LoginResponse(String message, User user, String storeType, Long storeId, Object availableWishlist) {
        this.message = message;
        this.user = user;
        this.storeType = storeType;
        this.storeId = storeId;
        this.availableWishlist = availableWishlist;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStoreType() { return storeType; }
    public void setStoreType(String storeType) { this.storeType = storeType; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public Object getAvailableWishlist() { return availableWishlist; }
    public void setAvailableWishlist(Object availableWishlist) { this.availableWishlist = availableWishlist; }
}