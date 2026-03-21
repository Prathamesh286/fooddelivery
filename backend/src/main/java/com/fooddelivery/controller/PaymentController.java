package com.fooddelivery.controller;

import com.fooddelivery.dto.PaymentDto;
import com.fooddelivery.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

  
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentDto.CreateOrderResponse> createOrder(
            @RequestBody PaymentDto.CreateOrderRequest req) {
        return ResponseEntity.ok(razorpayService.createRazorpayOrder(req.getOrderId()));
    }

   
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentDto.VerifyResponse> verify(
            @RequestBody PaymentDto.VerifyRequest req) {
        return ResponseEntity.ok(razorpayService.verifyPayment(req));
    }
}
