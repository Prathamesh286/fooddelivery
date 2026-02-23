package com.fooddelivery.controller;
import com.fooddelivery.dto.ReviewDto;
import com.fooddelivery.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/reviews") @RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final AuthService authService;
    @PostMapping @PreAuthorize("hasRole('CUSTOMER')") public ResponseEntity<ReviewDto.Response> add(@RequestBody ReviewDto.CreateRequest req, @AuthenticationPrincipal UserDetails ud) { return ResponseEntity.ok(reviewService.add(req, authService.getCurrentUser(ud.getUsername()))); }
    @GetMapping("/restaurant/{id}") public ResponseEntity<List<ReviewDto.Response>> get(@PathVariable Long id) { return ResponseEntity.ok(reviewService.getByRestaurant(id)); }
}
