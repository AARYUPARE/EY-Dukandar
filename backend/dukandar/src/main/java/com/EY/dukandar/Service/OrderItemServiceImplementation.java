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


    // ➤ Add new item
    @Override
    public OrderItem addItem(OrderItem orderItem) {

        Product product = productRepository.findById(orderItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Order order = orderRepository.findById(orderItem.getOrder().getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        orderItem.setOrder(order);
        orderItem.setPricePerUnit(product.getPrice());
        orderItem.setTotalPrice(product.getPrice() * orderItem.getQuantity());

        return orderItemRepository.save(orderItem);
    }


    // ➤ Get all items for an order
    @Override
    public List<OrderItem> getItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }


    // ➤ Get single item
    @Override
    public OrderItem getItem(Long id) {
        return orderItemRepository.findById(id).orElse(null);
    }


    // ➤ Delete item
    @Override
    public void deleteItem(Long id) {
        orderItemRepository.deleteById(id);
    }


    // ➤ Update item
    @Override
    public OrderItem updateItem(Long id, OrderItem details) {

        OrderItem existing = orderItemRepository.findById(id).orElse(null);
        if (existing == null) return null;

        // update basic info
        existing.setProductId(details.getProductId());
        existing.setSize(details.getSize());
        existing.setStoreId(details.getStoreId());
        existing.setQuantity(details.getQuantity());

        Product product = productRepository.findById(details.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setPricePerUnit(product.getPrice());
        existing.setTotalPrice(product.getPrice() * existing.getQuantity());

        if (details.getOrder() != null) {
            Order order = orderRepository.findById(details.getOrder().getId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            existing.setOrder(order);
        }

        return orderItemRepository.save(existing);
    }
}