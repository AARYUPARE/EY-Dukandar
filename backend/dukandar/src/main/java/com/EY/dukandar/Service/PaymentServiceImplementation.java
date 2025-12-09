package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Order;
import com.EY.dukandar.Model.Payment;
import com.EY.dukandar.Repository.OrderRepository;
import com.EY.dukandar.Repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentServiceImplementation implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentServiceImplementation(PaymentRepository paymentRepository,
                                        OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public Payment createPayment(Long orderId, String method) {

        // Fetch the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(method);    // <-- This matches your model
        payment.setPaymentStatus("PENDING"); // <-- This matches your model
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Override
    public Payment updatePaymentStatus(String transactionId, String status) {

        Payment payment = paymentRepository.findByTransactionId(transactionId);

        if (payment == null) {
            throw new RuntimeException("Payment not found: " + transactionId);
        }

        payment.setPaymentStatus(status);

        // If payment success — set timestamp
        if (status.equalsIgnoreCase("SUCCESS")) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByTransactionId(String transactionId) {

        Payment payment = paymentRepository.findByTransactionId(transactionId);

        if (payment == null) {
            throw new RuntimeException("Payment not found: " + transactionId);
        }

        return payment;
    }
}
