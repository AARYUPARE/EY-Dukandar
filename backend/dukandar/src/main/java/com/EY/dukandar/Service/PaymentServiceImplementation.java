package com.EY.dukandar.Service;

import com.EY.dukandar.LangChain.LangChainClient;
import com.EY.dukandar.Model.Order;
import com.EY.dukandar.Model.Payment;
import com.EY.dukandar.Repository.OrderRepository;
import com.EY.dukandar.Repository.PaymentRepository;
import com.EY.dukandar.WebSocket.WSEventDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentServiceImplementation implements PaymentService {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Autowired
    private final LangChainClient langChainClient;

    public PaymentServiceImplementation(PaymentRepository paymentRepository,
                                        OrderRepository orderRepository, LangChainClient langChainClient) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.langChainClient = langChainClient;
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

    @Override
    public Payment dummyPayment(String userId, String upiId) {

        try {
            // Simulate 3 second delay
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        Payment payment = new Payment();

        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));
        payment.setPaymentMethod("UPI");

        // Basic UPI validation
        if (upiId == null || !upiId.contains("@")) {
            payment.setPaymentStatus("FAILED");
            return payment;
        }

        // 70% success simulation

        payment.setPaymentStatus("SUCCESS");
        payment.setPaidAt(LocalDateTime.now());

        langChainClient.sendPaymentSuccessEvent();

        return payment;
    }

    @Override
    public void sendPaymentEvent(String amount)
    {
        WSEventDTO dto = new WSEventDTO();
        dto.setEventType("PAYMENT");

        Map<String, Object> data = new HashMap<>();
        data.put("amount", amount);

        dto.setData(data);

        simpMessagingTemplate.convertAndSend("/topic/event", dto);
    }
}
