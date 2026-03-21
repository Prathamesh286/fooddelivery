package com.fooddelivery.service;

import com.fooddelivery.dto.PaymentDto;
import com.fooddelivery.entity.Order;
import com.fooddelivery.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * RazorpayService
 *
 * Flow:
 *  1. Frontend calls POST /api/payment/create-order with { orderId }
 *     → We create a Razorpay order and return razorpayOrderId + amount + keyId
 *
 *  2. Frontend opens Razorpay checkout popup
 *     → User pays with UPI / Card / Net Banking / Wallet
 *     → Razorpay returns { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 *
 *  3. Frontend calls POST /api/payment/verify with those 3 values + our orderId
 *     → We verify the HMAC-SHA256 signature server-side
 *     → On success: mark order as paid (paymentDone=true)
 *
 * Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
 * Test UPI:   success@razorpay
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final OrderRepository orderRepo;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    /**
     * Step 1: Create a Razorpay order for the given internal order.
     * Amount must be in paise (₹1 = 100 paise).
     */
    public PaymentDto.CreateOrderResponse createRazorpayOrder(Long internalOrderId) {
        Order order = orderRepo.findById(internalOrderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + internalOrderId));

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", (int)(order.getTotalAmount() * 100)); // convert ₹ to paise
            options.put("currency", "INR");
            options.put("receipt", "order_" + internalOrderId);
            options.put("notes", new JSONObject()
                .put("internal_order_id", internalOrderId)
                .put("customer", order.getCustomer().getName())
            );

            com.razorpay.Order rzpOrder = client.orders.create(options);
            String rzpOrderId = rzpOrder.get("id");

            // Persist the Razorpay order ID on our order for later verification
            order.setRazorpayOrderId(rzpOrderId);
            orderRepo.save(order);

            log.info("Created Razorpay order {} for internal order {}", rzpOrderId, internalOrderId);

            return new PaymentDto.CreateOrderResponse(
                rzpOrderId,
                order.getTotalAmount() * 100, // paise
                "INR",
                keyId,
                "FoodDash Order #" + internalOrderId + " — " + order.getRestaurant().getName()
            );

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Payment gateway error: " + e.getMessage());
        }
    }

    /**
     * Step 2: Verify the Razorpay payment signature.
     * Signature = HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, keySecret)
     */
    public PaymentDto.VerifyResponse verifyPayment(PaymentDto.VerifyRequest req) {
        try {
            String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
            String expectedSignature = hmacSHA256(payload, keySecret);

            if (!expectedSignature.equals(req.getRazorpaySignature())) {
                log.warn("Payment signature mismatch for order {}", req.getOrderId());
                return new PaymentDto.VerifyResponse(false, "Payment verification failed — invalid signature", req.getOrderId());
            }

            // Mark order as paid
            Order order = orderRepo.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
            order.setPaymentDone(true);
            order.setRazorpayPaymentId(req.getRazorpayPaymentId());
            orderRepo.save(order);

            log.info("Payment verified for order {} — payment {}", req.getOrderId(), req.getRazorpayPaymentId());
            return new PaymentDto.VerifyResponse(true, "Payment successful", req.getOrderId());

        } catch (Exception e) {
            log.error("Payment verification error: {}", e.getMessage());
            return new PaymentDto.VerifyResponse(false, "Verification error: " + e.getMessage(), req.getOrderId());
        }
    }

    private String hmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
