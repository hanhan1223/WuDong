package com.wudong.service;

import com.wudong.common.enums.FavoriteTargetType;
import com.wudong.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 收藏服务 - 等价于 Node.js 版本的 FavoriteService
 */
public interface FavoriteService {

    /**
     * 收藏/取消收藏
     * @return true=收藏, false=取消收藏
     */
    boolean toggleFavorite(Long userId, FavoriteTargetType targetType, Long targetId);

    /**
     * 获取收藏列表
     */
    Page<Favorite> getFavorites(Long userId, FavoriteTargetType targetType, Pageable pageable);

    /**
     * 检查是否已收藏
     */
    boolean isFavorited(Long userId, FavoriteTargetType targetType, Long targetId);
}
