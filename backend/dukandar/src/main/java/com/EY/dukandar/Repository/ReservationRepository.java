package com.EY.dukandar.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.EY.dukandar.Model.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
