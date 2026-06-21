package com.wudong.controller;

import com.wudong.common.enums.FavoriteTargetType;
import com.wudong.common.enums.MessageType;
import com.wudong.common.enums.TargetType;
import com.wudong.common.response.ApiResponse;
import com.wudong.dto.common.*;
import com.wudong.entity.*;
import com.wudong.security.SecurityUtils;
import com.wudong.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "通用")
@RestController
@RequiredArgsConstructor
public class CommonController {

    private final ReviewService reviewService;
    private final FavoriteService favoriteService;
    private final MessageService messageService;
    private final AddressService addressService;

    // ==================== 评价 ====================

    @Operation(summary = "创建评价")
    @PostMapping("/api/reviews")
    public ApiResponse<Review> createReview(@Valid @RequestBody CreateReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Review review = reviewService.createReview(userId, request.getTargetType(), request.getTargetId(),
                request.getOrderId(), request.getRating(), request.getContent(), request.getImages());
        return ApiResponse.success(review, "评价成功");
    }

    @Operation(summary = "获取评价列表")
    @GetMapping("/api/reviews")
    public ApiResponse<Page<Review>> getReviews(
            @RequestParam TargetType targetType,
            @RequestParam Long targetId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(reviewService.getReviews(targetType, targetId, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "追评")
    @PostMapping("/api/reviews/{id}/append")
    public ApiResponse<Review> appendReview(@PathVariable Long id, @Valid @RequestBody AppendReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Review review = reviewService.appendReview(id, userId, request.getContent());
        return ApiResponse.success(review, "追评成功");
    }

    @Operation(summary = "商家回复评价")
    @PostMapping("/api/reviews/{id}/reply")
    public ApiResponse<Review> replyReview(@PathVariable Long id, @Valid @RequestBody ReplyReviewRequest request) {
        Long merchantId = SecurityUtils.getCurrentUserId();
        Review review = reviewService.replyReview(id, merchantId, request.getContent());
        return ApiResponse.success(review, "回复成功");
    }

    // ==================== 收藏 ====================

    @Operation(summary = "收藏/取消收藏")
    @PostMapping("/api/favorites")
    public ApiResponse<Boolean> toggleFavorite(@Valid @RequestBody ToggleFavoriteRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean favorited = favoriteService.toggleFavorite(userId, request.getTargetType(), request.getTargetId());
        return ApiResponse.success(favorited);
    }

    @Operation(summary = "获取收藏列表")
    @GetMapping("/api/favorites")
    public ApiResponse<Page<Favorite>> getFavorites(
            @RequestParam(required = false) FavoriteTargetType targetType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(favoriteService.getFavorites(userId, targetType, PageRequest.of(page - 1, pageSize)));
    }

    // ==================== 消息 ====================

    @Operation(summary = "获取消息列表")
    @GetMapping("/api/messages")
    public ApiResponse<Page<Message>> getMessages(
            @RequestParam(required = false) MessageType type,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(messageService.getMessages(userId, type, isRead, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "标记消息已读")
    @PutMapping("/api/messages/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        messageService.markAsRead(id, userId);
        return ApiResponse.success(null, "已标记为已读");
    }

    @Operation(summary = "标记所有消息已读")
    @PostMapping("/api/messages/read-all")
    public ApiResponse<Void> markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        messageService.markAllAsRead(userId);
        return ApiResponse.success(null, "已全部标记为已读");
    }

    @Operation(summary = "获取未读消息数")
    @GetMapping("/api/messages/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(messageService.getUnreadCount(userId));
    }

    // ==================== 地址 ====================

    @Operation(summary = "获取地址列表")
    @GetMapping("/api/addresses")
    public ApiResponse<List<Address>> getAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(addressService.getAddresses(userId));
    }

    @Operation(summary = "创建地址")
    @PostMapping("/api/addresses")
    public ApiResponse<Address> createAddress(@Valid @RequestBody CreateAddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Address address = addressService.createAddress(userId, request.getName(), request.getPhone(),
                request.getProvince(), request.getCity(), request.getDistrict(), request.getDetail(),
                request.getDefaulted());
        return ApiResponse.success(address, "地址创建成功");
    }

    @Operation(summary = "更新地址")
    @PutMapping("/api/addresses/{id}")
    public ApiResponse<Address> updateAddress(@PathVariable Long id, @Valid @RequestBody UpdateAddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Address address = addressService.updateAddress(id, userId, request.getName(), request.getPhone(),
                request.getProvince(), request.getCity(), request.getDistrict(), request.getDetail(),
                request.getDefaulted());
        return ApiResponse.success(address, "地址更新成功");
    }

    @Operation(summary = "删除地址")
    @DeleteMapping("/api/addresses/{id}")
    public ApiResponse<Void> deleteAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        addressService.deleteAddress(id, userId);
        return ApiResponse.success(null, "地址已删除");
    }

    @Operation(summary = "设置默认地址")
    @PutMapping("/api/addresses/{id}/default")
    public ApiResponse<Void> setDefaultAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        addressService.setDefaultAddress(id, userId);
        return ApiResponse.success(null, "默认地址已设置");
    }
}
