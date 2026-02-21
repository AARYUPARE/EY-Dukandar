package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Order;
import com.EY.dukandar.Model.OrderRequest;

import java.util.List;

public interface OrderService {

    List<Order> placeOrder(OrderRequest request);

    Order cancelOrder(Long orderId);

    Order getOrder(Long id);

    List<Order> getOrdersByUser(Long userId);
}