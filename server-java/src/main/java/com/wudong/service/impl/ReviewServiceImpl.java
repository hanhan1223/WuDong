package com.wudong.service.impl;

import com.wudong.common.enums.ContentType;
import com.wudong.common.enums.TargetType;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 评价服务实现
 */
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MerchantRepository merchantRepository;
    private final ProductRepository productRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomestayRepository homestayRepository;

    /**
     * 创建评价
     */
    @Transactional
    public Review createReview(Long userId, TargetType targetType, Long targetId, Long orderId,
                                Integer rating, String content, String images) {
        if (rating < 1 || rating > 5) {
            throw new BusinessException("评分必须在1-5之间");
        }

        Review review = new Review();
        review.setUser(new User());
        review.getUser().setId(userId);
        review.setTargetType(targetType);
        review.setTargetId(targetId);
        review.setOrderId(orderId);
        review.setRating(rating);
        review.setContent(content);
        review.setImages(images);
        review.setStatus(ContentType.NORMAL);

        return reviewRepository.save(review);
    }

    /**
     * 获取评价列表（按目标）
     */
    @Transactional(readOnly = true)
    public Page<Review> getReviews(TargetType targetType, Long targetId, Pageable pageable) {
        return reviewRepository.findByTargetTypeAndTargetIdAndStatusOrderByCreatedAtDesc(targetType, targetId, ContentType.NORMAL, pageable);
    }

    /**
     * 追评（仅一次）
     */
    @Transactional
    public Review appendReview(Long reviewId, Long userId, String appendContent) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException("评价不存在", 404));

        if (!review.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此评价", 403);
        }

        if (review.getAppendContent() != null) {
            throw new BusinessException("已追评，不能再次追评");
        }

        review.setAppendContent(appendContent);
        review.setAppendTime(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    /**
     * 商家回复评价（验证商家所有权）
     */
    @Transactional
    public Review replyReview(Long reviewId, Long merchantId, String replyContent) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException("评价不存在", 404));

        // 验证商家是否拥有被评价的目标实体
        validateMerchantOwnership(merchantId, review.getTargetType(), review.getTargetId());

        review.setReplyContent(replyContent);
        review.setReplyTime(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    /**
     * 验证商家对评价目标的所有权
     */
    private void validateMerchantOwnership(Long merchantId, TargetType targetType, Long targetId) {
        Merchant merchant = merchantRepository.findByUserId(merchantId)
                .orElseThrow(() -> new BusinessException("商家信息不存在", 404));

        switch (targetType) {
            case PRODUCT -> {
                Product product = productRepository.findById(targetId)
                        .orElseThrow(() -> new BusinessException("商品不存在", 404));
                if (!product.getMerchant().getId().equals(merchant.getId())) {
                    throw new BusinessException("无权回复此商品的评价", 403);
                }
            }
            case RESTAURANT -> {
                Restaurant restaurant = restaurantRepository.findById(targetId)
                        .orElseThrow(() -> new BusinessException("餐厅不存在", 404));
                if (!restaurant.getMerchant().getId().equals(merchant.getId())) {
                    throw new BusinessException("无权回复此餐厅的评价", 403);
                }
            }
            case HOMESTAY -> {
                Homestay homestay = homestayRepository.findById(targetId)
                        .orElseThrow(() -> new BusinessException("民宿不存在", 404));
                if (!homestay.getMerchant().getId().equals(merchant.getId())) {
                    throw new BusinessException("无权回复此民宿的评价", 403);
                }
            }
            case ROUTE -> {
                // 路线没有商家归属，暂不允许商家回复
                throw new BusinessException("路线评价不支持商家回复");
            }
            default -> throw new BusinessException("不支持的评价类型");
        }
    }
}
