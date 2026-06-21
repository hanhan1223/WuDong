package com.wudong.repository;

import com.wudong.entity.Review;
import com.wudong.common.enums.TargetType;
import com.wudong.common.enums.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByTargetTypeAndTargetIdAndStatusOrderByCreatedAtDesc(TargetType targetType, Long targetId, ContentType status, Pageable pageable);

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByTargetTypeAndTargetId(TargetType targetType, Long targetId);
}
