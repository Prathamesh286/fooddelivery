package com.fooddelivery.controller;
import com.fooddelivery.dto.OrderDto;
import com.fooddelivery.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.Response> place(@Valid @RequestBody OrderDto.CreateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.placeOrder(req, authService.getCurrentUser(ud.getUsername())));
    }
    @GetMapping("/my") @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDto.Response>> myOrders(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.getMyOrders(authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.Response> getById(@PathVariable Long id) { return ResponseEntity.ok(orderService.getById(id)); }

    @GetMapping("/restaurant/{restaurantId}") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto.Response>> restaurantOrders(@PathVariable Long restaurantId, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId, authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @PatchMapping("/{id}/confirm") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto.Response> confirm(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.confirmOrder(id, authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @PatchMapping("/{id}/prepare") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto.Response> prepare(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.startPreparing(id, authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @PatchMapping("/{id}/ready") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto.Response> ready(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.markReadyForPickup(id, authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @PatchMapping("/{id}/cancel") @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.Response> cancel(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.cancelOrder(id, authService.getCurrentUser(ud.getUsername()).getId()));
    }

    // ─── Agent endpoints ──────────────────────────────────────────────────────
    @GetMapping("/agent/my") @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<List<OrderDto.Response>> agentOrders(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.getAgentOrders(authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @GetMapping("/agent/available") @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<List<OrderDto.Response>> availablePickups() { return ResponseEntity.ok(orderService.getAvailablePickups()); }

    @PatchMapping("/{id}/pickup") @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<OrderDto.Response> pickup(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.agentPickup(id, authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @PatchMapping("/{id}/self-assign") @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<OrderDto.Response> selfAssign(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.selfAssign(id, authService.getCurrentUser(ud.getUsername()).getId()));
    }
    @PatchMapping("/{id}/deliver") @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<OrderDto.Response> deliver(@PathVariable Long id, @RequestParam String otp, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.deliverOrder(id, authService.getCurrentUser(ud.getUsername()).getId(), otp));
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    @GetMapping("/all") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto.Response>> all() { return ResponseEntity.ok(orderService.getAllOrders()); }
    @PatchMapping("/{id}/status") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto.Response> adminStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.adminUpdateStatus(id, status));
    }
}
