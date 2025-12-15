package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Reservation;
import com.EY.dukandar.Service.ReservationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/create")
    public Reservation createReservation(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam String size,
            @RequestParam Long storeId
    ) {
        return reservationService.createReservation(userId, productId, size, storeId);
    }

    @PutMapping("/{id}/status")
    public Reservation updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return reservationService.updateStatus(id, status);
    }
}
