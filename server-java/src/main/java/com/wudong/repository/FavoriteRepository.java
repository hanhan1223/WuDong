package com.wudong.repository;

import com.wudong.entity.Favorite;
import com.wudong.common.enums.FavoriteTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndTargetTypeAndTargetId(Long userId, FavoriteTargetType targetType, Long targetId);

    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, FavoriteTargetType targetType, Long targetId);

    Page<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Favorite> findByUserIdAndTargetTypeOrderByCreatedAtDesc(Long userId, FavoriteTargetType targetType, Pageable pageable);
}
