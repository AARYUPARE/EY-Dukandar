package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Payment;
import com.EY.dukandar.WebSocket.WSEventDTO;

public interface PaymentService {

    Payment createPayment(Long orderId, String method);

    Payment updatePaymentStatus(String transactionId, String status);

    Payment getPaymentByTransactionId(String transactionId);

    Payment dummyPayment(String userId, String upiId);

    void sendPaymentEvent(String amount);
}

