package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Order;
import com.EY.dukandar.Model.OrderItem;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Repository.OrderItemRepository;
import com.EY.dukandar.Repository.ProductRepository;
import com.EY.dukandar.Repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemServiceImplementation implements OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public OrderItem addItem(OrderItem orderItem) {
        // Fetch product to get price
        Product product = productRepository.findById(orderItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Fetch order entity for relation
        Order order = orderRepository.findById(orderItem.getOrder().getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        orderItem.setOrder(order);

        // Set price per unit from product
        orderItem.setPricePerUnit(product.getPrice());

        // Calculate total price
        orderItem.setTotalPrice(product.getPrice() * orderItem.getQuantity());

        return orderItemRepository.save(orderItem);
    }

    @Override
    public List<OrderItem> getItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    @Override
    public OrderItem getItem(Long id) {
        return orderItemRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteItem(Long id) {
        orderItemRepository.deleteById(id);
    }

    @Override
    public OrderItem updateItem(Long id, OrderItem orderItemDetails) {
        OrderItem existing = orderItemRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        // Update quantity and productId if needed
        existing.setQuantity(orderItemDetails.getQuantity());
        existing.setProductId(orderItemDetails.getProductId());

        // Fetch product for price consistency
        Product product = productRepository.findById(orderItemDetails.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setPricePerUnit(product.getPrice());
        existing.setTotalPrice(product.getPrice() * orderItemDetails.getQuantity());

        // Update order reference if needed
        if (orderItemDetails.getOrder() != null) {
            Order order = orderRepository.findById(orderItemDetails.getOrder().getId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            existing.setOrder(order);
        }

        return orderItemRepository.save(existing);
    }
}
