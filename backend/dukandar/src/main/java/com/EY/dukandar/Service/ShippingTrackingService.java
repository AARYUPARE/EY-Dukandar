package com.EY.dukandar.Service;

import com.EY.dukandar.Model.ShippingTracking;

public interface ShippingTrackingService {

    ShippingTracking createTracking(Long orderId);

    ShippingTracking updateStatus(Long orderId, String status, String message);

    ShippingTracking getTrackingByOrder(Long orderId);
}

