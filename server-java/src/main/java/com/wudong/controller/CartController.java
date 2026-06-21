package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.cart.*;
import com.wudong.entity.CartItem;
import com.wudong.security.SecurityUtils;
import com.wudong.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "购物车")
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @Operation(summary = "添加商品到购物车")
    @PostMapping("/add")
    public ApiResponse<CartItem> addToCart(@Valid @RequestBody AddToCartRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartItem item = cartService.addToCart(userId, request.getProductId(), request.getSkuId(), request.getQuantity());
        return ApiResponse.success(item, "已添加到购物车");
    }

    @Operation(summary = "获取购物车列表")
    @GetMapping
    public ApiResponse<List<CartItem>> getCartItems() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(cartService.getCartItems(userId));
    }

    @Operation(summary = "更新购物车项数量")
    @PostMapping("/update")
    public ApiResponse<CartItem> updateQuantity(@Valid @RequestBody UpdateCartRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartItem item = cartService.updateQuantity(request.getId(), userId, request.getQuantity());
        return ApiResponse.success(item);
    }

    @Operation(summary = "删除购物车项")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> removeCartItem(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        cartService.removeCartItem(id, userId);
        return ApiResponse.success(null, "已删除");
    }

    @Operation(summary = "清空购物车")
    @DeleteMapping
    public ApiResponse<Void> clearCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        cartService.clearCart(userId);
        return ApiResponse.success(null, "购物车已清空");
    }

    @Operation(summary = "切换购物车项选中状态")
    @PostMapping("/select")
    public ApiResponse<CartItem> toggleSelect(@Valid @RequestBody ToggleSelectRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartItem item = cartService.toggleSelect(request.getId(), userId);
        return ApiResponse.success(item);
    }

    @Operation(summary = "全选/取消全选")
    @PostMapping("/select-all")
    public ApiResponse<Void> toggleSelectAll(@Valid @RequestBody ToggleSelectAllRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        cartService.toggleSelectAll(userId, request.getSelected());
        return ApiResponse.success(null, request.getSelected() ? "已全选" : "已取消全选");
    }

    @Operation(summary = "获取选中的购物车项")
    @GetMapping("/selected")
    public ApiResponse<List<CartItem>> getSelectedItems() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(cartService.getSelectedItems(userId));
    }
}
