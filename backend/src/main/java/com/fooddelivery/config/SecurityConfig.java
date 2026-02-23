package com.fooddelivery.config;
import com.fooddelivery.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;
@Configuration @EnableWebSecurity @EnableMethodSecurity @RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(c->c.disable())
            .cors(c->c.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(a->a
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/restaurants/**","/api/menu/**","/api/reviews/**").permitAll()
                .anyRequest().authenticated())
            .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:3000"));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
    @Bean
    public AuthenticationProvider authProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }
    @Bean public AuthenticationManager authManager(AuthenticationConfiguration c) throws Exception { return c.getAuthenticationManager(); }
    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
