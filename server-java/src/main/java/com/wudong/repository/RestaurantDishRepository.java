package com.wudong.repository;

import com.wudong.entity.RestaurantDish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantDishRepository extends JpaRepository<RestaurantDish, Long> {

    List<RestaurantDish> findByRestaurantIdAndStatusTrue(Long restaurantId);
}
