package com.wudong.service;

import com.wudong.common.enums.TargetType;
import com.wudong.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 评价服务 - 等价于 Node.js 版本的 ReviewService
 */
public interface ReviewService {

    /**
     * 创建评价
     */
    Review createReview(Long userId, TargetType targetType, Long targetId, Long orderId,
                        Integer rating, String content, String images);

    /**
     * 获取评价列表（按目标）
     */
    Page<Review> getReviews(TargetType targetType, Long targetId, Pageable pageable);

    /**
     * 追评（仅一次）
     */
    Review appendReview(Long reviewId, Long userId, String appendContent);

    /**
     * 商家回复评价（验证商家所有权）
     */
    Review replyReview(Long reviewId, Long merchantId, String replyContent);
}
