package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.OrderItem;
import com.EY.dukandar.Service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")  // plural is a common REST convention
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    // Add new order item
    @PostMapping
    public OrderItem add(@RequestBody OrderItem item) {
        return orderItemService.addItem(item);
    }

    // Get all items by Order ID
    @GetMapping("/order/{orderId}")
    public List<OrderItem> getItems(@PathVariable Long orderId) {
        return orderItemService.getItems(orderId);
    }

    // Get single item by ID
    @GetMapping("/{id}")
    public OrderItem getItem(@PathVariable Long id) {
        return orderItemService.getItem(id);
    }

    // Delete item by ID
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        orderItemService.deleteItem(id);
        return "Order item deleted successfully!";
    }

    // Update an existing item
    @PutMapping("/{id}")
    public OrderItem update(@PathVariable Long id, @RequestBody OrderItem item) {
        return orderItemService.updateItem(id, item);
    }
}