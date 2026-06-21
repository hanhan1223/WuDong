package com.wudong.service.impl;

import com.wudong.common.enums.ProductStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.CartItem;
import com.wudong.entity.Product;
import com.wudong.entity.User;
import com.wudong.repository.CartItemRepository;
import com.wudong.repository.ProductRepository;
import com.wudong.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 购物车服务实现
 */
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    /**
     * 添加商品到购物车
     */
    @Transactional
    public CartItem addToCart(Long userId, Long productId, Long skuId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("商品不存在", 404));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BusinessException("商品已下架");
        }

        // 检查是否已在购物车中
        CartItem existingItem = cartItemRepository.findByUserIdAndProductIdAndSkuId(userId, productId, skuId).orElse(null);

        if (existingItem != null) {
            // 增加数量
            existingItem.setQuantity(existingItem.getQuantity() + (quantity != null ? quantity : 1));
            return cartItemRepository.save(existingItem);
        }

        // 新增购物车项
        CartItem cartItem = new CartItem();
        cartItem.setUser(new User());
        cartItem.getUser().setId(userId);
        cartItem.setProductId(productId);
        cartItem.setSkuId(skuId);
        cartItem.setQuantity(quantity != null ? quantity : 1);
        cartItem.setSelected(true);

        return cartItemRepository.save(cartItem);
    }

    /**
     * 获取购物车列表
     */
    public List<CartItem> getCartItems(Long userId) {
        return cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 更新购物车项数量
     */
    @Transactional
    public CartItem updateQuantity(Long cartItemId, Long userId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException("购物车项不存在", 404));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此购物车项", 403);
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    /**
     * 删除购物车项
     */
    @Transactional
    public void removeCartItem(Long cartItemId, Long userId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException("购物车项不存在", 404));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此购物车项", 403);
        }

        cartItemRepository.delete(cartItem);
    }

    /**
     * 清空购物车
     */
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    /**
     * 获取选中的购物车项
     */
    public List<CartItem> getSelectedItems(Long userId) {
        return cartItemRepository.findByUserIdAndSelectedTrue(userId);
    }

    /**
     * 切换购物车项选中状态
     */
    @Transactional
    public CartItem toggleSelect(Long cartItemId, Long userId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException("购物车项不存在", 404));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此购物车项", 403);
        }

        cartItem.setSelected(!cartItem.getSelected());
        return cartItemRepository.save(cartItem);
    }

    /**
     * 全选/取消全选
     */
    @Transactional
    public void toggleSelectAll(Long userId, boolean selected) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (CartItem item : items) {
            item.setSelected(selected);
            cartItemRepository.save(item);
        }
    }
}
