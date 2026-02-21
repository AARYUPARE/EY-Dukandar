package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import com.EY.dukandar.Model.Reservation;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Reservation findByProductIdAndSizeAndStoreIdAndUserId(Long productId, String size, Long storeId, Long userId);
}
