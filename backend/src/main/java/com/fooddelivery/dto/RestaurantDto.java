package com.fooddelivery.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
public class RestaurantDto {
    @Data public static class CreateRequest {
        @NotBlank private String name;
        private String description,address,phone,imageUrl,cuisine,openingHours;
        private int deliveryTime=30;
        private double deliveryFee=30.0,minOrderAmount=100.0;
    }
    @Data public static class Response {
        private Long id,ownerId;
        private String name,description,address,phone,imageUrl,cuisine,openingHours;
        private double rating,deliveryFee,minOrderAmount;
        private int reviewCount,deliveryTime;
        private boolean open;
    }
}
