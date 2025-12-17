package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Order;

import java.util.List;

public interface OrderService {

    List<Order> placeOrder(Long userId, String deliveryType);

    Order cancelOrder(Long orderId);

    Order getOrder(Long id);

    List<Order> getOrdersByUser(Long userId);
}