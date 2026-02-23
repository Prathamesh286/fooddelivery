package com.fooddelivery.controller;
import com.fooddelivery.dto.RestaurantDto;
import com.fooddelivery.service.AuthService;
import com.fooddelivery.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/restaurants") @RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;
    private final AuthService authService;
    @GetMapping public ResponseEntity<List<RestaurantDto.Response>> getAll(@RequestParam(required=false) String search) { return ResponseEntity.ok(restaurantService.getAll(search)); }
    @GetMapping("/{id}") public ResponseEntity<RestaurantDto.Response> getById(@PathVariable Long id) { return ResponseEntity.ok(restaurantService.getById(id)); }
    @GetMapping("/my") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<List<RestaurantDto.Response>> getMy(@AuthenticationPrincipal UserDetails ud) { return ResponseEntity.ok(restaurantService.getMy(authService.getCurrentUser(ud.getUsername()).getId())); }
    @PostMapping @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<RestaurantDto.Response> create(@RequestBody RestaurantDto.CreateRequest req, @AuthenticationPrincipal UserDetails ud) { return ResponseEntity.ok(restaurantService.create(req, authService.getCurrentUser(ud.getUsername()))); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<RestaurantDto.Response> update(@PathVariable Long id, @RequestBody RestaurantDto.CreateRequest req, @AuthenticationPrincipal UserDetails ud) { return ResponseEntity.ok(restaurantService.update(id, req, authService.getCurrentUser(ud.getUsername()).getId())); }
    @PatchMapping("/{id}/toggle") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<Void> toggle(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) { restaurantService.toggle(id, authService.getCurrentUser(ud.getUsername()).getId()); return ResponseEntity.ok().build(); }
}
