package com.wudong.service.impl;

import com.wudong.common.enums.FavoriteTargetType;
import com.wudong.entity.Favorite;
import com.wudong.entity.User;
import com.wudong.repository.FavoriteRepository;
import com.wudong.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 收藏服务实现 - 等价于 Node.js 版本的 FavoriteService
 */
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;

    /**
     * 收藏/取消收藏
     * @return true=收藏, false=取消收藏
     */
    @Override
    @Transactional
    public boolean toggleFavorite(Long userId, FavoriteTargetType targetType, Long targetId) {
        Favorite existing = favoriteRepository.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId).orElse(null);

        if (existing != null) {
            favoriteRepository.delete(existing);
            return false; // 取消收藏
        }

        Favorite favorite = new Favorite();
        favorite.setUser(new User());
        favorite.getUser().setId(userId);
        favorite.setTargetType(targetType);
        favorite.setTargetId(targetId);
        favoriteRepository.save(favorite);
        return true; // 收藏
    }

    /**
     * 获取收藏列表
     */
    @Override
    public Page<Favorite> getFavorites(Long userId, FavoriteTargetType targetType, Pageable pageable) {
        if (targetType != null) {
            return favoriteRepository.findByUserIdAndTargetTypeOrderByCreatedAtDesc(userId, targetType, pageable);
        }
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 检查是否已收藏
     */
    @Override
    public boolean isFavorited(Long userId, FavoriteTargetType targetType, Long targetId) {
        return favoriteRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
    }
}
