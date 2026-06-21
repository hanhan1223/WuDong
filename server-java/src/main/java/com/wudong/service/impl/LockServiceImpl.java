package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.exception.BusinessException;
import com.wudong.service.LockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 分布式锁服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LockServiceImpl implements LockService {

    private final StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = BusinessConstants.CACHE_PREFIX_LOCK;
    private static final long DEFAULT_TTL = 30; // 30秒

    // Lua 脚本：只有锁的持有者才能释放锁
    private static final String UNLOCK_SCRIPT =
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
            "return redis.call('del', KEYS[1]) " +
            "else return 0 end";

    /**
     * 获取锁
     */
    public String acquire(String lockKey, long ttlSeconds) {
        String key = LOCK_PREFIX + lockKey;
        String value = UUID.randomUUID().toString();

        try {
            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, value, ttlSeconds, TimeUnit.SECONDS);
            if (success != null && success) {
                return value;
            }
        } catch (Exception e) {
            log.warn("Lock acquire failed for key {}: {}", lockKey, e.getMessage());
        }
        return null;
    }

    /**
     * 释放锁
     */
    public boolean release(String lockKey, String lockValue) {
        String key = LOCK_PREFIX + lockKey;

        try {
            DefaultRedisScript<Long> script = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);
            Long result = redisTemplate.execute(script, Collections.singletonList(key), lockValue);
            return result != null && result > 0;
        } catch (Exception e) {
            log.warn("Lock release failed for key {}: {}", lockKey, e.getMessage());
            return false;
        }
    }

    /**
     * 尝试获取锁（使用默认 TTL）
     */
    public String tryAcquire(String lockKey) {
        return acquire(lockKey, DEFAULT_TTL);
    }

    /**
     * 在锁保护下执行操作
     */
    public <T> T withLock(String lockKey, Supplier<T> action) {
        return withLock(lockKey, DEFAULT_TTL, action);
    }

    /**
     * 在锁保护下执行操作（自定义 TTL）
     */
    public <T> T withLock(String lockKey, long ttlSeconds, Supplier<T> action) {
        String lockValue = acquire(lockKey, ttlSeconds);
        if (lockValue == null) {
            throw new BusinessException("无法获取锁: " + lockKey);
        }

        try {
            return action.get();
        } finally {
            release(lockKey, lockValue);
        }
    }
}
