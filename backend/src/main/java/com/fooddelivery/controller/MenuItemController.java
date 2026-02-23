package com.fooddelivery.controller;
import com.fooddelivery.dto.MenuItemDto;
import com.fooddelivery.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/menu") @RequiredArgsConstructor
public class MenuItemController {
    private final MenuItemService menuService;
    private final AuthService authService;
    @GetMapping("/restaurant/{id}") public ResponseEntity<List<MenuItemDto.Response>> get(@PathVariable Long id) { return ResponseEntity.ok(menuService.getByRestaurant(id)); }
    @PostMapping("/restaurant/{id}") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<MenuItemDto.Response> add(@PathVariable Long id, @RequestBody MenuItemDto.CreateRequest req, @AuthenticationPrincipal UserDetails ud) { return ResponseEntity.ok(menuService.add(id, req, authService.getCurrentUser(ud.getUsername()).getId())); }
    @PutMapping("/{itemId}") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<MenuItemDto.Response> update(@PathVariable Long itemId, @RequestBody MenuItemDto.CreateRequest req, @AuthenticationPrincipal UserDetails ud) { return ResponseEntity.ok(menuService.update(itemId, req, authService.getCurrentUser(ud.getUsername()).getId())); }
    @PatchMapping("/{itemId}/toggle") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<Void> toggle(@PathVariable Long itemId, @AuthenticationPrincipal UserDetails ud) { menuService.toggleAvailability(itemId, authService.getCurrentUser(ud.getUsername()).getId()); return ResponseEntity.ok().build(); }
    @DeleteMapping("/{itemId}") @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')") public ResponseEntity<Void> delete(@PathVariable Long itemId, @AuthenticationPrincipal UserDetails ud) { menuService.delete(itemId, authService.getCurrentUser(ud.getUsername()).getId()); return ResponseEntity.noContent().build(); }
}
