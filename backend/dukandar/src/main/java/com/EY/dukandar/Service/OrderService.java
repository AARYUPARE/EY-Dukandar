package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Order;

public interface OrderService {
    Order placeOrder(Order order);
    Order getOrder(Long id);
}
