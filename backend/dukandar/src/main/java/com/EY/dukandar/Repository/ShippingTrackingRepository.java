package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.ShippingTracking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShippingTrackingRepository extends JpaRepository<ShippingTracking, Long> {

    Optional<ShippingTracking> findByOrderId(Long orderId);
}

