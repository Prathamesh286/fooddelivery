package com.fooddelivery.dto;
import com.fooddelivery.enums.OrderStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
public class OrderDto {
    @Data public static class ItemRequest { private Long menuItemId; private int quantity; }
    @Data public static class CreateRequest {
        private Long restaurantId;
        @NotEmpty private List<ItemRequest> items;
        @NotBlank private String deliveryAddress;
        private String paymentMethod="CASH",specialInstructions;
    }
    @Data public static class ItemResponse {
        private Long id,menuItemId; private String menuItemName; private int quantity; private double price,subtotal;
    }
    @Data public static class Response {
        private Long id,customerId,restaurantId,deliveryAgentId;
        private String customerName,restaurantName,deliveryAgentName,deliveryAddress;
        private List<ItemResponse> orderItems;
        private OrderStatus status;
        private double subtotal,deliveryFee,totalAmount;
        private String paymentMethod,specialInstructions,deliveryOtp;
        private boolean paymentDone,otpVerified;
        private LocalDateTime createdAt,updatedAt,assignedAt,pickedUpAt,deliveredAt;
    }
}
