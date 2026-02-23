package com.fooddelivery.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
public class MenuItemDto {
    @Data public static class CreateRequest {
        @NotBlank private String name;
        private String description,imageUrl,category;
        @Positive private double price;
        private boolean vegetarian;
    }
    @Data public static class Response {
        private Long id,restaurantId;
        private String name,description,imageUrl,category;
        private double price;
        private boolean vegetarian,available;
    }
}
