package com.wudong.repository;

import com.wudong.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<CartItem> findByUserIdAndProductIdAndSkuId(Long userId, Long productId, Long skuId);

    void deleteByUserId(Long userId);

    List<CartItem> findByUserIdAndSelectedTrue(Long userId);
}
