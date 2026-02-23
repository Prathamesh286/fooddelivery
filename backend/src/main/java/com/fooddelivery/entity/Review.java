package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "reviews")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false) private User customer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "restaurant_id", nullable = false) private Restaurant restaurant;
    private int rating;
    private String comment;
    @Column(updatable = false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
}
