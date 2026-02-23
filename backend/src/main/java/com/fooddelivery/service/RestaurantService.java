package com.fooddelivery.service;
import com.fooddelivery.dto.RestaurantDto;
import com.fooddelivery.entity.*;
import com.fooddelivery.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepo;
    public List<RestaurantDto.Response> getAll(String search) {
        List<Restaurant> list = (search!=null&&!search.isBlank()) ? restaurantRepo.search(search) : restaurantRepo.findAll();
        return list.stream().map(this::toResp).collect(Collectors.toList());
    }
    public RestaurantDto.Response getById(Long id) {
        return toResp(restaurantRepo.findById(id).orElseThrow(()->new RuntimeException("Not found")));
    }
    public List<RestaurantDto.Response> getMy(Long ownerId) {
        return restaurantRepo.findByOwnerId(ownerId).stream().map(this::toResp).collect(Collectors.toList());
    }
    public RestaurantDto.Response create(RestaurantDto.CreateRequest req, User owner) {
        Restaurant r = Restaurant.builder().name(req.getName()).description(req.getDescription()).address(req.getAddress())
                .phone(req.getPhone()).imageUrl(req.getImageUrl()).cuisine(req.getCuisine()).openingHours(req.getOpeningHours())
                .deliveryTime(req.getDeliveryTime()).deliveryFee(req.getDeliveryFee()).minOrderAmount(req.getMinOrderAmount()).owner(owner).build();
        return toResp(restaurantRepo.save(r));
    }
    public RestaurantDto.Response update(Long id, RestaurantDto.CreateRequest req, Long ownerId) {
        Restaurant r = restaurantRepo.findById(id).orElseThrow();
        if (!r.getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        r.setName(req.getName()); r.setDescription(req.getDescription()); r.setAddress(req.getAddress());
        r.setPhone(req.getPhone()); r.setImageUrl(req.getImageUrl()); r.setCuisine(req.getCuisine());
        r.setOpeningHours(req.getOpeningHours()); r.setDeliveryTime(req.getDeliveryTime());
        r.setDeliveryFee(req.getDeliveryFee()); r.setMinOrderAmount(req.getMinOrderAmount());
        return toResp(restaurantRepo.save(r));
    }
    public void toggle(Long id, Long ownerId) {
        Restaurant r = restaurantRepo.findById(id).orElseThrow();
        if (!r.getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        r.setOpen(!r.isOpen()); restaurantRepo.save(r);
    }
    public RestaurantDto.Response toResp(Restaurant r) {
        RestaurantDto.Response res = new RestaurantDto.Response();
        res.setId(r.getId()); res.setName(r.getName()); res.setDescription(r.getDescription());
        res.setAddress(r.getAddress()); res.setPhone(r.getPhone()); res.setImageUrl(r.getImageUrl());
        res.setCuisine(r.getCuisine()); res.setOpeningHours(r.getOpeningHours()); res.setRating(r.getRating());
        res.setReviewCount(r.getReviewCount()); res.setDeliveryTime(r.getDeliveryTime());
        res.setDeliveryFee(r.getDeliveryFee()); res.setMinOrderAmount(r.getMinOrderAmount()); res.setOpen(r.isOpen());
        if (r.getOwner()!=null) res.setOwnerId(r.getOwner().getId());
        return res;
    }
}
