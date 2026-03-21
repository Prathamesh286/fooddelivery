package com.fooddelivery.service;

import com.fooddelivery.dto.AuthDto;
import com.fooddelivery.entity.User;
import com.fooddelivery.enums.Role;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Google OAuth Service
 * Validates Google ID tokens by calling Google's tokeninfo endpoint,
 * then creates or retrieves the user account and issues a JWT.
 *
 * Configuration: Set GOOGLE_CLIENT_ID in application.properties
 *   google.client-id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
 */
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    // Inject from application.properties
    @org.springframework.beans.factory.annotation.Value("${google.client-id:}")
    private String googleClientId;

    public AuthDto.AuthResponse authenticateGoogleUser(String idToken) {
        try {
            // Verify token with Google's tokeninfo endpoint
            GoogleTokenPayload payload = verifyGoogleToken(idToken);

            // Ensure audience matches our client ID (if configured)
            if (!googleClientId.isEmpty() && !googleClientId.equals(payload.getAud())) {
                throw new RuntimeException("Invalid Google token audience");
            }

            String email = payload.getEmail();
            String name = payload.getName();

            // Find or create user
            User user = userRepo.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .password(encoder.encode(UUID.randomUUID().toString()))
                    .role(Role.CUSTOMER)
                    .active(true)
                    .build();
                return userRepo.save(newUser);
            });

            String jwt = jwtUtil.generate(user.getEmail());
            return new AuthDto.AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole().name());

        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    private GoogleTokenPayload verifyGoogleToken(String idToken) throws Exception {
        // Method 1: Verify via Google's tokeninfo API (simple, no library needed)
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Token verification failed with status: " + response.statusCode());
        }

        Map<String, Object> tokenData = objectMapper.readValue(response.body(), Map.class);

        GoogleTokenPayload payload = new GoogleTokenPayload();
        payload.setEmail((String) tokenData.get("email"));
        payload.setName((String) tokenData.get("name"));
        payload.setAud((String) tokenData.get("aud"));
        payload.setSub((String) tokenData.get("sub"));

        return payload;
    }

    // Inner payload class
    @lombok.Data
    public static class GoogleTokenPayload {
        private String email;
        private String name;
        private String aud;  // audience (should match client ID)
        private String sub;  // Google user ID
        private String picture;
    }
}
