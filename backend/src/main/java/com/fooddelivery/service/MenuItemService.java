package com.fooddelivery.service;
import com.fooddelivery.dto.MenuItemDto;
import com.fooddelivery.entity.*;
import com.fooddelivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class MenuItemService {
    private final MenuItemRepository menuRepo;
    private final RestaurantRepository restaurantRepo;
    public List<MenuItemDto.Response> getByRestaurant(Long rid) {
        return menuRepo.findByRestaurantId(rid).stream().map(this::toResp).collect(Collectors.toList());
    }
    public MenuItemDto.Response add(Long rid, MenuItemDto.CreateRequest req, Long ownerId) {
        Restaurant r = restaurantRepo.findById(rid).orElseThrow();
        if (!r.getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        MenuItem m = MenuItem.builder().name(req.getName()).description(req.getDescription()).price(req.getPrice())
                .imageUrl(req.getImageUrl()).category(req.getCategory()).vegetarian(req.isVegetarian()).restaurant(r).build();
        return toResp(menuRepo.save(m));
    }
    public MenuItemDto.Response update(Long itemId, MenuItemDto.CreateRequest req, Long ownerId) {
        MenuItem m = menuRepo.findById(itemId).orElseThrow();
        if (!m.getRestaurant().getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        m.setName(req.getName()); m.setDescription(req.getDescription()); m.setPrice(req.getPrice());
        m.setImageUrl(req.getImageUrl()); m.setCategory(req.getCategory()); m.setVegetarian(req.isVegetarian());
        return toResp(menuRepo.save(m));
    }
    public void toggleAvailability(Long itemId, Long ownerId) {
        MenuItem m = menuRepo.findById(itemId).orElseThrow();
        if (!m.getRestaurant().getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        m.setAvailable(!m.isAvailable()); menuRepo.save(m);
    }
    public void delete(Long itemId, Long ownerId) {
        MenuItem m = menuRepo.findById(itemId).orElseThrow();
        if (!m.getRestaurant().getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        menuRepo.delete(m);
    }
    MenuItemDto.Response toResp(MenuItem m) {
        MenuItemDto.Response r = new MenuItemDto.Response();
        r.setId(m.getId()); r.setName(m.getName()); r.setDescription(m.getDescription()); r.setPrice(m.getPrice());
        r.setImageUrl(m.getImageUrl()); r.setCategory(m.getCategory()); r.setVegetarian(m.isVegetarian());
        r.setAvailable(m.isAvailable()); r.setRestaurantId(m.getRestaurant().getId());
        return r;
    }
}
