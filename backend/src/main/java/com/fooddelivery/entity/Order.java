package com.fooddelivery.entity;

import com.fooddelivery.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "orders")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false) private User customer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "restaurant_id", nullable = false) private Restaurant restaurant;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) private List<OrderItem> orderItems;

    @Enumerated(EnumType.STRING) @Builder.Default private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false) private String deliveryAddress;
    private double subtotal;
    private double deliveryFee;
    private double totalAmount;
    private String paymentMethod;
    @Builder.Default private boolean paymentDone = false;
    private String specialInstructions;

    // Agent assignment
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "delivery_agent_id") private User deliveryAgent;
    private LocalDateTime assignedAt;       // when agent picked it up
    private LocalDateTime pickedUpAt;       // when agent picked up from restaurant
    private LocalDateTime deliveredAt;      // when delivered

    // OTP for delivery confirmation
    private String deliveryOtp;
    @Builder.Default private boolean otpVerified = false;

    @Column(updatable = false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @PreUpdate public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
