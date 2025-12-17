package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Order;
import com.EY.dukandar.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Place order by userId and deliveryType (in request params)
    @PostMapping("/place")
    public List<Order> placeOrder(
            @RequestParam Long userId,
            @RequestParam String deliveryType) {
        return orderService.placeOrder(userId, deliveryType);
    }

    // Get order by ID
    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return orderService.getOrdersByUser(userId);
    }


    // Cancel order by ID
    @PostMapping("/{id}/cancel")
    public Order cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }
}