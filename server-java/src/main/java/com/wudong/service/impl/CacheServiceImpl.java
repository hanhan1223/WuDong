package com.wudong.service.impl;

import com.wudong.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 缓存服务实现 - 等价于 Node.js 版本的 CacheService
 * Redis 操作封装，支持 JSON 序列化和缓存穿透保护
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheServiceImpl implements CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    /**
     * 获取缓存
     */
    @Override
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            return value != null ? (T) value : null;
        } catch (Exception e) {
            log.warn("Cache get failed for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 设置缓存
     */
    @Override
    public void set(String key, Object value, long ttlSeconds) {
        try {
            redisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Cache set failed for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * 删除缓存
     */
    @Override
    public void del(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Cache delete failed for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * 批量删除缓存（模式匹配）
     */
    @Override
    public void delPattern(String pattern) {
        try {
            Collection<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.warn("Cache delete pattern failed for {}: {}", pattern, e.getMessage());
        }
    }

    /**
     * 缓存穿透保护 - 先查缓存，未命中则执行查询并缓存结果
     */
    @Override
    public <T> T getOrSet(String key, Supplier<T> supplier, long ttlSeconds) {
        T value = get(key);
        if (value != null) {
            return value;
        }

        value = supplier.get();
        if (value != null) {
            set(key, value, ttlSeconds);
        }
        return value;
    }

    /**
     * 递增
     */
    @Override
    public Long incr(String key) {
        try {
            return stringRedisTemplate.opsForValue().increment(key);
        } catch (Exception e) {
            log.warn("Cache incr failed for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 设置过期时间
     */
    @Override
    public void expire(String key, long ttlSeconds) {
        try {
            redisTemplate.expire(key, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Cache expire failed for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * 检查 key 是否存在
     */
    @Override
    public boolean exists(String key) {
        try {
            Boolean exists = redisTemplate.hasKey(key);
            return exists != null && exists;
        } catch (Exception e) {
            log.warn("Cache exists check failed for key {}: {}", key, e.getMessage());
            return false;
        }
    }
}
