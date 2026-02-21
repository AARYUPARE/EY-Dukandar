package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Reservation;

import java.util.Map;

public interface ReservationService {

    Reservation createReservation(Long userId, Long productId, String size, Long storeId);

    Reservation updateStatus(Long id, String newStatus);

    Map<String, Object> auth(Long userId, Long productId, String size, Long storeId);
}
