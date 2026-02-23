package com.fooddelivery.service;
import com.fooddelivery.dto.AuthDto;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) throw new RuntimeException("Email already registered");
        User u = User.builder().name(req.getName()).email(req.getEmail()).password(encoder.encode(req.getPassword()))
                .phone(req.getPhone()).address(req.getAddress()).role(req.getRole()).vehicleNumber(req.getVehicleNumber()).build();
        userRepo.save(u);
        return new AuthDto.AuthResponse(jwtUtil.generate(u.getEmail()), u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User u = userRepo.findByEmail(req.getEmail()).orElseThrow();
        return new AuthDto.AuthResponse(jwtUtil.generate(u.getEmail()), u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
    public User getCurrentUser(String email) {
        return userRepo.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
    }
}
