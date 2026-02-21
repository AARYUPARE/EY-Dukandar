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
    public List<Order> placeOrder(OrderRequest request) {

        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("No items provided for order");
        }

        List<Order> createdOrders = new ArrayList<>();

        // Since agent does not send storeId, we group dynamically
        Map<Long, List<OrderItemAgentRequest>> storeWiseItems = new HashMap<>();

        // STEP 1️⃣ — Find inventory + group by store
        for (OrderItemAgentRequest item : request.getItems()) {

            List<Inventory> inventories =
                    inventoryRepository.findByProductId(item.getProduct_id());

            if (inventories == null || inventories.isEmpty()) {
                throw new RuntimeException(
                        "Product not available in inventory: " + item.getProduct_id()
                );
            }

            // Pick first store having stock
            Inventory selectedInventory = null;

            for (Inventory inv : inventories) {
                if (inv.getStockQuantity() >= item.getQuantity()) {
                    selectedInventory = inv;
                    break;
                }
            }

            if (selectedInventory == null) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + item.getProduct_id()
                );
            }

            storeWiseItems
                    .computeIfAbsent(selectedInventory.getStoreId(), k -> new ArrayList<>())
                    .add(item);
        }

        // STEP 2️⃣ — Create separate order per store
        for (Map.Entry<Long, List<OrderItemAgentRequest>> entry : storeWiseItems.entrySet()) {

            Long storeId = entry.getKey();
            List<OrderItemAgentRequest> items = entry.getValue();

            Order order = new Order();
            order.setUserId(request.getUserId());
            order.setDeliveryType(request.getDeliveryType());
            order.setPickupStoreId(storeId);
            order.setOrderStatus("PLACED");
            order.setOrderDate(LocalDateTime.now());

            List<OrderItem> orderItems = new ArrayList<>();
            double totalAmount = 0.0;

            for (OrderItemAgentRequest reqItem : items) {

                // Fetch inventory again for safe stock reduction
                List<Inventory> inventories =
                        inventoryRepository.findByProductId(reqItem.getProduct_id());

                Inventory inv = inventories.stream()
                        .filter(i -> i.getStoreId().equals(storeId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException(
                                "Inventory not found during order processing"
                        ));

                if (inv.getStockQuantity() < reqItem.getQuantity()) {
                    throw new RuntimeException(
                            "Stock changed. Insufficient stock for product "
                                    + reqItem.getProduct_id()
                    );
                }

                // 🔻 Reduce stock
                inventoryService.reduceStock(
                        inv.getStoreId(),
                        inv.getProductId(),
                        inv.getSize(),
                        reqItem.getQuantity()
                );

                // Fetch actual product (never trust frontend price)
                Product product = productRepository
                        .findById(reqItem.getProduct_id())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProductId(product.getId());
                orderItem.setStoreId(inv.getStoreId());
                orderItem.setSize(inv.getSize());
                orderItem.setQuantity(reqItem.getQuantity());
                orderItem.setPricePerUnit(product.getPrice());
                orderItem.setTotalPrice(product.getPrice() * reqItem.getQuantity());

                orderItems.add(orderItem);
                totalAmount += orderItem.getTotalPrice();
            }

            order.setItems(orderItems);
            order.setTotalAmount(totalAmount);

            // 💾 Save order
            Order savedOrder = orderRepository.save(order);
            createdOrders.add(savedOrder);

            // 🚚 Create shipping tracking
            shippingTrackingService.createTracking(savedOrder.getId());
        }

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