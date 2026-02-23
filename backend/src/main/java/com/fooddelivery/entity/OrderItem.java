package com.fooddelivery.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "order_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) private Order order;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "menu_item_id", nullable = false) private MenuItem menuItem;
    private int quantity;
    private double price;
    private double subtotal;
}
