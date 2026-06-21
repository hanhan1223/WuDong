package com.wudong.service;

import com.wudong.entity.CartItem;

import java.util.List;

/**
 * 购物车服务 - 等价于 Node.js 版本的 CartService
 */
public interface CartService {

    /**
     * 添加商品到购物车
     */
    CartItem addToCart(Long userId, Long productId, Long skuId, Integer quantity);

    /**
     * 获取购物车列表
     */
    List<CartItem> getCartItems(Long userId);

    /**
     * 更新购物车项数量
     */
    CartItem updateQuantity(Long cartItemId, Long userId, Integer quantity);

    /**
     * 删除购物车项
     */
    void removeCartItem(Long cartItemId, Long userId);

    /**
     * 清空购物车
     */
    void clearCart(Long userId);

    /**
     * 获取选中的购物车项
     */
    List<CartItem> getSelectedItems(Long userId);

    /**
     * 切换购物车项选中状态
     */
    CartItem toggleSelect(Long cartItemId, Long userId);

    /**
     * 全选/取消全选
     */
    void toggleSelectAll(Long userId, boolean selected);
}
