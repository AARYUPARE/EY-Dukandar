package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Payment;

public interface PaymentService {

    Payment createPayment(Long orderId, String method);

    Payment updatePaymentStatus(String transactionId, String status);

    Payment getPaymentByTransactionId(String transactionId);
}

