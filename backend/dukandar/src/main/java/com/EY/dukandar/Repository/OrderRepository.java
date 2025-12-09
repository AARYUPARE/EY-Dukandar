package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}

