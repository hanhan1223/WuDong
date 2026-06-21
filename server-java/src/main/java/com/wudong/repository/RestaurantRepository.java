package com.wudong.repository;

import com.wudong.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Page<Restaurant> findByStatusTrue(Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.status = true AND (r.name LIKE %:keyword% OR r.address LIKE %:keyword%)")
    Page<Restaurant> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Restaurant> findByMerchantId(Long merchantId, Pageable pageable);
}
