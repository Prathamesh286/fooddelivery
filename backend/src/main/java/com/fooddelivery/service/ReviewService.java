package com.fooddelivery.service;
import com.fooddelivery.dto.ReviewDto;
import com.fooddelivery.entity.*;
import com.fooddelivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final RestaurantRepository restaurantRepo;
    public ReviewDto.Response add(ReviewDto.CreateRequest req, User customer) {
        Restaurant r = restaurantRepo.findById(req.getRestaurantId()).orElseThrow();
        Review rev = Review.builder().customer(customer).restaurant(r).rating(req.getRating()).comment(req.getComment()).build();
        Review saved = reviewRepo.save(rev);
        Double avg = reviewRepo.avgRating(r.getId());
        int count = reviewRepo.countByRestaurantId(r.getId());
        r.setRating(avg!=null ? Math.round(avg*10.0)/10.0 : 0);
        r.setReviewCount(count);
        restaurantRepo.save(r);
        return toResp(saved);
    }
    public List<ReviewDto.Response> getByRestaurant(Long rid) {
        return reviewRepo.findByRestaurantIdOrderByCreatedAtDesc(rid).stream().map(this::toResp).collect(Collectors.toList());
    }
    private ReviewDto.Response toResp(Review rev) {
        ReviewDto.Response r = new ReviewDto.Response();
        r.setId(rev.getId()); r.setCustomerId(rev.getCustomer().getId()); r.setCustomerName(rev.getCustomer().getName());
        r.setRestaurantId(rev.getRestaurant().getId()); r.setRating(rev.getRating()); r.setComment(rev.getComment()); r.setCreatedAt(rev.getCreatedAt());
        return r;
    }
}
