package com.EY.dukandar.Service;

import com.EY.dukandar.Model.OrderItem;
import java.util.List;

public interface OrderItemService {

    OrderItem addItem(OrderItem orderItem);

    List<OrderItem> getItems(Long orderId);

    OrderItem getItem(Long id);

    void deleteItem(Long id);

    OrderItem updateItem(Long id, OrderItem orderItem);
}