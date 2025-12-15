package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Reservation;

public interface ReservationService {

    Reservation createReservation(Long userId, Long productId, String size, Long storeId);

    Reservation updateStatus(Long id, String newStatus);
}
