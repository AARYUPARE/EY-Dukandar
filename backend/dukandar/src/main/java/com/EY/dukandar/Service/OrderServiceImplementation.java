package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Order;
import com.EY.dukandar.Model.OrderItem;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Repository.OrderRepository;
import com.EY.dukandar.Repository.ProductRepository;
import com.EY.dukandar.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderServiceImplementation implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Order placeOrder(Order orderRequest) {

        Order order = new Order();
        order.setUserId(orderRequest.getUserId());
        order.setOrderStatus(orderRequest.getOrderStatus());
        order.setDeliveryType(orderRequest.getDeliveryType());
        order.setPickupStoreId(orderRequest.getPickupStoreId());
        order.setOrderDate(orderRequest.getOrderDate());

        List<OrderItem> finalItems = new ArrayList<>();
        double totalAmount = 0.0;

        // Map to track and merge order items by productId
        Map<Long, OrderItem> productToOrderItem = new HashMap<>();

        for (OrderItem itemReq : orderRequest.getItems()) {

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (productToOrderItem.containsKey(itemReq.getProductId())) {
                // Merge quantities for the same product
                OrderItem existingItem = productToOrderItem.get(itemReq.getProductId());
                existingItem.setQuantity(existingItem.getQuantity() + itemReq.getQuantity());

                double newTotalPrice = existingItem.getPricePerUnit() * existingItem.getQuantity();
                existingItem.setTotalPrice(newTotalPrice);

            } else {
                // Create new OrderItem
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(itemReq.getProductId());
                item.setQuantity(itemReq.getQuantity());
                item.setPricePerUnit(product.getPrice());
                item.setTotalPrice(product.getPrice() * itemReq.getQuantity());

                productToOrderItem.put(itemReq.getProductId(), item);
            }
        }

        // Add merged items to final list and calculate total order amount
        for (OrderItem item : productToOrderItem.values()) {
            finalItems.add(item);
            totalAmount += item.getTotalPrice();
        }

        order.setItems(finalItems);
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElse(null);
    }
}
