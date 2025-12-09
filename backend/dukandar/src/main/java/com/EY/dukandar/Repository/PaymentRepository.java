package com.EY.dukandar.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.EY.dukandar.Model.Payment;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Payment findByTransactionId(String transactionId);
}
