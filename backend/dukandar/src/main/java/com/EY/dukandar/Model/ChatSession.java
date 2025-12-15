package com.EY.dukandar.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(unique = true, nullable = false)
    private String sessionId;

    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;

    // 🔥 NEW: Store last shown products as JSON
    @Column(columnDefinition = "TEXT")
    private String lastProductSnapshot;

    // ---------- Getters & Setters ----------

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public String getLastProductSnapshot() {
        return lastProductSnapshot;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setLastActiveAt(LocalDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public void setLastProductSnapshot(String lastProductSnapshot) {
        this.lastProductSnapshot = lastProductSnapshot;
    }
}
