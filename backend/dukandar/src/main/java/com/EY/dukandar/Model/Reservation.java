package com.EY.dukandar.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;          // ID of user making reservation
    private Long productId;       // Which product is reserved
    private String size;          // Size of the product (L, M, XL)
    private Long storeId;         // Store where item is reserved

    private LocalDateTime reservedAt; // Timestamp of reservation

    private String status;        // "RESERVED", "CANCELLED", "PICKED_UP"

    // --------------------
    // Constructors
    // --------------------
    public Reservation() {}

    public Reservation(Long userId, Long productId, String size, Long storeId, String status) {
        this.userId = userId;
        this.productId = productId;
        this.size = size;
        this.storeId = storeId;
        this.status = status;
        this.reservedAt = LocalDateTime.now();
    }

    // --------------------
    // Getters and Setters
    // --------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public LocalDateTime getReservedAt() {
        return reservedAt;
    }

    public void setReservedAt(LocalDateTime reservedAt) {
        this.reservedAt = reservedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
