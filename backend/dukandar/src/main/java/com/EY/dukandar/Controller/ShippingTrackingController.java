package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.ShippingTracking;
import com.EY.dukandar.Service.ShippingTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
public class ShippingTrackingController {

    @Autowired
    private ShippingTrackingService shippingTrackingService;

    // Create tracking when order is placed
    @PostMapping("/create/{orderId}")
    public ShippingTracking createTracking(@PathVariable Long orderId) {
        return shippingTrackingService.createTracking(orderId);
    }

    // Update tracking status
    @PutMapping("/update/{orderId}")
    public ShippingTracking updateTracking(
            @PathVariable Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String message
    ) {
        return shippingTrackingService.updateStatus(orderId, status, message);
    }

    // Get tracking by Order ID
    @GetMapping("/{orderId}")
    public ShippingTracking getTracking(@PathVariable Long orderId) {
        return shippingTrackingService.getTrackingByOrder(orderId);
    }
}
