package com.fooddelivery.repository;
import com.fooddelivery.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByOpenTrue();
    @Query("SELECT r FROM Restaurant r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Restaurant> search(String q);
}
