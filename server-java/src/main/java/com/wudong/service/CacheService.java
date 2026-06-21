package com.wudong.service;

import java.util.function.Supplier;

/**
 * 缓存服务 - 等价于 Node.js 版本的 CacheService
 * Redis 操作封装，支持 JSON 序列化和缓存穿透保护
 */
public interface CacheService {

    /**
     * 获取缓存
     */
    <T> T get(String key);

    /**
     * 设置缓存
     */
    void set(String key, Object value, long ttlSeconds);

    /**
     * 删除缓存
     */
    void del(String key);

    /**
     * 批量删除缓存（模式匹配）
     */
    void delPattern(String pattern);

    /**
     * 缓存穿透保护 - 先查缓存，未命中则执行查询并缓存结果
     */
    <T> T getOrSet(String key, Supplier<T> supplier, long ttlSeconds);

    /**
     * 递增
     */
    Long incr(String key);

    /**
     * 设置过期时间
     */
    void expire(String key, long ttlSeconds);

    /**
     * 检查 key 是否存在
     */
    boolean exists(String key);
}
