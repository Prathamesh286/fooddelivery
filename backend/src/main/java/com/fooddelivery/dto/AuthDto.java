package com.fooddelivery.dto;
import com.fooddelivery.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;
public class AuthDto {
    @Data public static class RegisterRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank @Size(min=6) private String password;
        private String phone, address, vehicleNumber;
        private Role role = Role.CUSTOMER;
    }
    @Data public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
    }
    @Data public static class AuthResponse {
        private String token; private Long id; private String name, email, role;
        public AuthResponse(String token,Long id,String name,String email,String role){
            this.token=token;this.id=id;this.name=name;this.email=email;this.role=role;
        }
    }
}
