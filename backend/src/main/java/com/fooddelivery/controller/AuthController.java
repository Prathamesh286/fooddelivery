package com.fooddelivery.controller;

import com.fooddelivery.dto.AuthDto;
import com.fooddelivery.dto.GoogleAuthDto;
import com.fooddelivery.entity.User;
import com.fooddelivery.service.AuthService;
import com.fooddelivery.service.GoogleAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * Google OAuth login endpoint.
     * Expects: { "token": "<Google ID Token>" }
     * Returns: JWT + user info (same as /login response)
     */
    @PostMapping("/google")
    public ResponseEntity<AuthDto.AuthResponse> googleLogin(@RequestBody GoogleAuthDto dto) {
        return ResponseEntity.ok(googleAuthService.authenticateGoogleUser(dto.getToken()));
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(@AuthenticationPrincipal UserDetails ud) {
        User u = authService.getCurrentUser(ud.getUsername());
        u.setPassword(null);
        return ResponseEntity.ok(u);
    }
}
