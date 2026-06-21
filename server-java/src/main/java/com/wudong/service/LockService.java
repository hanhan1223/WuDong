package com.wudong.service;

import java.util.function.Supplier;

/**
 * 分布式锁服务 - 等价于 Node.js 版本的 LockService
 * 基于 Redis SETNX 的分布式锁，使用 Lua 脚本保证原子性释放
 */
public interface LockService {

    /**
     * 获取锁
     */
    String acquire(String lockKey, long ttlSeconds);

    /**
     * 释放锁
     */
    boolean release(String lockKey, String lockValue);

    /**
     * 尝试获取锁（使用默认 TTL）
     */
    String tryAcquire(String lockKey);

    /**
     * 在锁保护下执行操作
     */
    <T> T withLock(String lockKey, Supplier<T> action);

    /**
     * 在锁保护下执行操作（自定义 TTL）
     */
    <T> T withLock(String lockKey, long ttlSeconds, Supplier<T> action);
}
