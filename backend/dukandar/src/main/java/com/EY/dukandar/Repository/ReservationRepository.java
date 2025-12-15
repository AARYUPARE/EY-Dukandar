package com.EY.dukandar.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.EY.dukandar.Model.Reservation;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {


}
