package com.EY.dukandar.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_tracking")
public class ShippingTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → Order
    @Column(nullable = false)
    private Long orderId;

    // Current tracking stage
    @Column(nullable = false)
    private String status;
    // Examples:
    // ORDER_PLACED, PACKED, SHIPPED, ARRIVED_AT_HUB, OUT_FOR_DELIVERY, DELIVERED

    @Column
    private String statusMessage;
    // Example: "Your package has left the seller facility."

    // When status was last updated
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Expected delivery date
    @Column
    private LocalDateTime estimatedDelivery;

    public ShippingTracking() {}

    public ShippingTracking(Long id, Long orderId, String status,
                            String statusMessage, LocalDateTime updatedAt,
                            LocalDateTime estimatedDelivery) {
        this.id = id;
        this.orderId = orderId;
        this.status = status;
        this.statusMessage = statusMessage;
        this.updatedAt = updatedAt;
        this.estimatedDelivery = estimatedDelivery;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
}

