package com.EY.dukandar.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")   // 'order' is reserved keyword in SQL
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;     // FK → User table

    @Column(nullable = false)
    private Long productId;  // FK → Product table

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private String orderStatus;
    // Examples: "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"

    @Column(nullable = false)
    private String deliveryType;
    // "HOME_DELIVERY" or "STORE_PICKUP"

    @Column
    private Long pickupStoreId;
    // Only used when deliveryType = "STORE_PICKUP"

    @Column(nullable = false)
    private LocalDateTime orderDate;

    public Order() {}

    public Order(Long id, Long userId, Long productId, int quantity, double totalAmount,
                 String orderStatus, String deliveryType, Long pickupStoreId, LocalDateTime orderDate) {
        this.id = id;
        this.userId = userId;
        this.productId = productId;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.deliveryType = deliveryType;
        this.pickupStoreId = pickupStoreId;
        this.orderDate = orderDate;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }

    public Long getPickupStoreId() { return pickupStoreId; }
    public void setPickupStoreId(Long pickupStoreId) { this.pickupStoreId = pickupStoreId; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
}

