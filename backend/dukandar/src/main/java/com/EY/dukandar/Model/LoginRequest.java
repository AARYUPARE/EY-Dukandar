package com.EY.dukandar.Model;

public class LoginRequest {

    private String email;
    private String password;
    private String storeType; // "web" or "kiosk"
    private Long storeId;     // required only for kiosk

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getStoreType() { return storeType; }
    public void setStoreType(String storeType) { this.storeType = storeType; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }
}