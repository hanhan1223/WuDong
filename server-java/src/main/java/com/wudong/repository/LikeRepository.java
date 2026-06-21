package com.wudong.repository;

import com.wudong.entity.Like;
import com.wudong.common.enums.LikeTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserIdAndTargetTypeAndTargetId(Long userId, LikeTargetType targetType, Long targetId);

    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, LikeTargetType targetType, Long targetId);

    int deleteByUserIdAndTargetTypeAndTargetId(Long userId, LikeTargetType targetType, Long targetId);
}
