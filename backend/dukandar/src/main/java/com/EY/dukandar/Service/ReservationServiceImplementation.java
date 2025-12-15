package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Reservation;
import com.EY.dukandar.Repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReservationServiceImplementation implements ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Override
    public Reservation createReservation(Long userId, Long productId, String size, Long storeId) {
        Reservation reservation = new Reservation(
                userId,
                productId,
                size,
                storeId,
                "RESERVED"
        );
        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation updateStatus(Long id, String newStatus) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(newStatus);
        return reservationRepository.save(reservation);
    }
}
