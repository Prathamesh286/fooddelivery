package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "menu_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    private String description;
    @Column(nullable = false) private double price;
    private String imageUrl;
    private String category;
    @Builder.Default private boolean vegetarian = false;
    @Builder.Default private boolean available = true;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "restaurant_id", nullable = false) private Restaurant restaurant;
}
