package com.fooddelivery.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
public class ReviewDto {
    @Data public static class CreateRequest {
        private Long restaurantId;
        @Min(1) @Max(5) private int rating;
        private String comment;
    }
    @Data public static class Response {
        private Long id,customerId,restaurantId;
        private String customerName,comment;
        private int rating;
        private LocalDateTime createdAt;
    }
}
