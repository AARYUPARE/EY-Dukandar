package com.EY.dukandar.Model;

import java.util.List;

public class OrderRequest {

    private Long userId;
    private String deliveryType;
    private String paymentMethod;
    private List<OrderItemAgentRequest> items;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public List<OrderItemAgentRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemAgentRequest> items) {
        this.items = items;
    }
}