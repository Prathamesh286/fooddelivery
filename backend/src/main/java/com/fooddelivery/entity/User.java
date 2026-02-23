package com.fooddelivery.entity;

import com.fooddelivery.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false) private String password;
    private String phone;
    private String address;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Builder.Default private boolean active = true;
    @Builder.Default private boolean available = true; // for delivery agents
    private String vehicleNumber; // for delivery agents
    @Column(updatable = false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
}
