package com.EY.dukandar.Model;

public class ChatRequest {

    private Long userId;       // logged-in user id or null for guest
    private String sessionId;  // unique chat session id
    private String message;    // user input message

    public ChatRequest() {}

    // Getters & Setters
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getSessionId() {
        return sessionId;
    }
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
