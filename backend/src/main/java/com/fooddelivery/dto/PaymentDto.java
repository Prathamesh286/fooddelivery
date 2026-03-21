package com.fooddelivery.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

public class PaymentDto {

    /** Sent from frontend to create a Razorpay order */
    @Data
    public static class CreateOrderRequest {
        private Long orderId;       // our internal order ID
    }

    /** Returned to frontend after creating Razorpay order */
    @Data @AllArgsConstructor
    public static class CreateOrderResponse {
        private String razorpayOrderId;   // rzp_order_xxx
        private double amount;            // in paise (₹1 = 100 paise)
        private String currency;
        private String keyId;             // Razorpay public key for frontend
        private String orderDescription;
    }

    /** Sent from frontend after successful Razorpay payment */
    @Data
    public static class VerifyRequest {
        private Long orderId;                   // our internal order ID
        private String razorpayOrderId;         // from Razorpay
        private String razorpayPaymentId;       // from Razorpay
        private String razorpaySignature;       // from Razorpay — we verify this
    }

    /** Response after verification */
    @Data @AllArgsConstructor
    public static class VerifyResponse {
        private boolean success;
        private String message;
        private Long orderId;
    }
}
