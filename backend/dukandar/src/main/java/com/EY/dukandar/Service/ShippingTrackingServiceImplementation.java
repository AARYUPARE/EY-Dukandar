package com.EY.dukandar.Service;

import com.EY.dukandar.Model.ShippingTracking;
import com.EY.dukandar.Repository.ShippingTrackingRepository;
import com.EY.dukandar.Service.ShippingTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShippingTrackingServiceImplementation implements ShippingTrackingService {

    @Autowired
    private ShippingTrackingRepository repository;

    @Override
    public ShippingTracking createTracking(Long orderId) {
        ShippingTracking tracking = new ShippingTracking();
        tracking.setOrderId(orderId);
        tracking.setStatus("ORDER_PLACED");
        tracking.setStatusMessage("Your order has been placed.");
        tracking.setUpdatedAt(LocalDateTime.now());
        tracking.setEstimatedDelivery(LocalDateTime.now().plusDays(4));

        return repository.save(tracking);
    }

    @Override
    public ShippingTracking updateStatus(Long orderId, String status, String message) {
        ShippingTracking tracking = repository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + orderId));

        tracking.setStatus(status);
        tracking.setStatusMessage(message);
        tracking.setUpdatedAt(LocalDateTime.now());

        return repository.save(tracking);
    }

    @Override
    public ShippingTracking getTrackingByOrder(Long orderId) {
        return repository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + orderId));
    }
}

