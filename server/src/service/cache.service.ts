import { Provide, Inject } from "@midwayjs/core";
import { RedisService } from "@midwayjs/redis";

/**
 * Redis 缓存服务
 * 提供统一的缓存读写和失效策略
 */
@Provide()
export class CacheService {
  @Inject()
  redisService!: RedisService;

  /** 缓存前缀常量 */
  static readonly PREFIX = {
    USER: "user:",
    PRODUCT: "product:",
    ORDER: "order:",
    HOT_PRODUCTS: "hot:products:",
    SEARCH_HISTORY: "search:history:",
    RATE_LIMIT: "rate:",
  } as const;

  /** 默认过期时间（秒） */
  static readonly DEFAULT_TTL = 3600; // 1小时
  static readonly SHORT_TTL = 300; // 5分钟
  static readonly LONG_TTL = 86400; // 24小时

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 解析后的对象，不存在返回 null
   */
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.redisService.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值（自动 JSON 序列化）
   * @param ttl 过期时间（秒），默认 1 小时
   */
  async set(
    key: string,
    value: any,
    ttl = CacheService.DEFAULT_TTL,
  ): Promise<void> {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl > 0) {
      await this.redisService.setex(key, ttl, serialized);
    } else {
      await this.redisService.set(key, serialized);
    }
  }

  /**
   * 删除缓存
   * @param keys 缓存键（支持多个）
   */
  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  /**
   * 模式匹配删除缓存
   * @param pattern 模式，如 "user:*"
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redisService.keys(pattern);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  /**
   * 缓存穿透保护：获取或设置
   * 如果缓存不存在，调用回调函数获取数据并写入缓存
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl = CacheService.DEFAULT_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * 原子递增
   * @param key 缓存键
   * @param increment 递增值，默认 1
   */
  async incr(key: string, increment = 1): Promise<number> {
    if (increment === 1) {
      return await this.redisService.incr(key);
    }
    return await this.redisService.incrby(key, increment);
  }

  /**
   * 设置过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<void> {
    await this.redisService.expire(key, ttl);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redisService.exists(key);
    return result === 1;
  }
}
