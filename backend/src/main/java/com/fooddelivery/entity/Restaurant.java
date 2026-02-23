package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity @Table(name = "restaurants")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    private String description;
    private String address;
    private String phone;
    private String imageUrl;
    private String cuisine;
    private String openingHours;
    @Builder.Default private double rating = 0.0;
    @Builder.Default private int reviewCount = 0;
    @Builder.Default private int deliveryTime = 30;
    @Builder.Default private double deliveryFee = 30.0;
    @Builder.Default private double minOrderAmount = 100.0;
    @Builder.Default private boolean open = true;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "owner_id") private User owner;
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL) private List<MenuItem> menuItems;
}
