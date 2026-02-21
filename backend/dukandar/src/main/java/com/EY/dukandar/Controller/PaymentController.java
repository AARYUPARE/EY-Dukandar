package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Payment;
import com.EY.dukandar.Service.PaymentService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/init")
    public void initPayment(
            @RequestParam String amount
    )
    {
        paymentService.sendPaymentEvent(amount);
    }

    @PostMapping("/dummy")
    public Payment dummyPayment(@RequestParam String userId,
                                @RequestParam String upiId) {

        return paymentService.dummyPayment(userId, upiId);
    }

    @PostMapping("/create/{orderId}")
    public Payment createPayment(@PathVariable Long orderId, @RequestParam String method) {
        return paymentService.createPayment(orderId, method);
    }

    @PutMapping("/update/{transactionId}")
    public Payment updateStatus(@PathVariable String transactionId, @RequestParam String status) {
        return paymentService.updatePaymentStatus(transactionId, status);
    }

    @GetMapping("/{transactionId}")
    public Payment getPayment(@PathVariable String transactionId) {
        return paymentService.getPaymentByTransactionId(transactionId);
    }
}

