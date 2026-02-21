package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Reservation;
import com.EY.dukandar.Repository.ReservationRepository;
import com.EY.dukandar.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public final ReservationRepository reservationRepository;

    public ReservationController(ReservationService reservationService, ReservationRepository reservationRepository) {
        this.reservationService = reservationService;
        this.reservationRepository = reservationRepository;
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

    @GetMapping("/auth")
    public  Map<String, Object> getReserveForAuth(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam String size,
            @RequestParam Long storeId
    )
    {
        return reservationService.auth(userId, productId, size, storeId);
    }

    @PutMapping("/{id}/status")
    public Reservation updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return reservationService.updateStatus(id, status);
    }
}
