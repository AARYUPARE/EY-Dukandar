package com.EY.dukandar.Service;

import com.EY.dukandar.Model.*;
import com.EY.dukandar.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class OrderServiceImplementation implements OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private InventoryService inventoryService;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;

    // ⭐ Add shipping tracking service
    @Autowired private ShippingTrackingService shippingTrackingService;


    // =====================================================================
    // ✅ PLACE ORDER (Split cart by store → stock check → reduce stock → create orders)
    // =====================================================================
    @Override
    public List<Order> placeOrder(Long userId, String deliveryType) {

        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Group items by store
        Map<Long, List<CartItem>> storeWiseItems = new HashMap<>();

        for (CartItem item : cart.getItems()) {
            Inventory inv = inventoryRepository
                    .findByProductIdAndSizeAndStoreId(
                            item.getProduct().getId(),
                            item.getSize(),
                            item.getStoreId()
                    );

            if (inv == null) {
                throw new RuntimeException("Inventory not found for cart item.");
            }

            storeWiseItems.computeIfAbsent(inv.getStoreId(), k -> new ArrayList<>()).add(item);
        }

        List<Order> createdOrders = new ArrayList<>();

        //  Process per-store orders
        for (Map.Entry<Long, List<CartItem>> entry : storeWiseItems.entrySet()) {

            Long storeId = entry.getKey();
            List<CartItem> items = entry.getValue();

            // 1️⃣ Check stock availability
            for (CartItem ci : items) {
                Inventory inv = inventoryRepository.findByProductIdAndSizeAndStoreId(
                        ci.getProduct().getId(), ci.getSize(), storeId
                );

                if (inv == null || inv.getStockQuantity() < ci.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for productId " +
                            ci.getProduct().getId() +
                            " from store " + storeId + ", size " + ci.getSize());
                }
            }

            // 2️⃣ Create order & reduce stock
            Order order = new Order();
            order.setUserId(userId);
            order.setPickupStoreId(storeId);
            order.setDeliveryType(deliveryType);
            order.setOrderStatus("PLACED");
            order.setOrderDate(LocalDateTime.now());

            List<OrderItem> orderItems = new ArrayList<>();
            double totalAmount = 0.0;

            for (CartItem ci : items) {

                Inventory inv = inventoryRepository
                        .findByProductIdAndSizeAndStoreId(ci.getProduct().getId(), ci.getSize(), storeId);

                // Reduce stock
                inventoryService.reduceStock(storeId, inv.getProductId(), inv.getSize(), ci.getQuantity());

                Product product = ci.getProduct();

                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setProductId(product.getId());
                oi.setQuantity(ci.getQuantity());
                oi.setSize(inv.getSize());
                oi.setPricePerUnit(product.getPrice());
                oi.setTotalPrice(product.getPrice() * ci.getQuantity());

                orderItems.add(oi);
                totalAmount += oi.getTotalPrice();
            }

            order.setItems(orderItems);
            order.setTotalAmount(totalAmount);

            // ⭐ Save order
            Order savedOrder = orderRepository.save(order);
            createdOrders.add(savedOrder);

            // ⭐⭐⭐ CREATE SHIPPING TRACKING FOR THIS ORDER ⭐⭐⭐
            shippingTrackingService.createTracking(savedOrder.getId());
        }

        // 3️⃣ Clear cart after successful orders
        cartItemRepository.deleteAll(cart.getItems());

        return createdOrders;
    }


    // =====================================================================
    // ✅ CANCEL ORDER (restore stock + update tracking)
    // =====================================================================
    @Override
    public Order cancelOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Order already cancelled");
        }

        for (OrderItem item : order.getItems()) {

            Inventory inv = inventoryRepository
                    .findByProductIdAndSizeAndStoreId(
                            item.getProductId(),
                            item.getSize(),
                            order.getPickupStoreId()
                    );

            if (inv == null) {
                throw new RuntimeException("Inventory not found for restoring stock.");
            }

            // Restore stock
            inventoryService.updateStock(inv.getStoreId(), inv.getProductId(), item.getQuantity(), inv.getSize());
        }

        order.setOrderStatus("CANCELLED");
        Order saved = orderRepository.save(order);

        // ⭐⭐⭐ UPDATE SHIPPING TRACKING STATUS ⭐⭐⭐
        shippingTrackingService.updateStatus(
                orderId,
                "CANCELLED",
                "Order was cancelled by user."
        );

        return saved;
    }


    // =====================================================================
    //  GET ORDER
    // =====================================================================
    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}