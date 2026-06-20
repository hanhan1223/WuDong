import { Provide, Inject } from "@midwayjs/core";
import { RedisService } from "@midwayjs/redis";
import { nanoid } from "nanoid";

/**
 * 分布式锁服务 - 基于 Redis SETNX
 * 用于秒杀、库存扣减等并发场景防止超卖
 */
@Provide()
export class LockService {
  @Inject()
  redisService!: RedisService;

  /** 锁前缀 */
  private static readonly PREFIX = "lock:";

  /** 默认锁超时时间（秒） */
  private static readonly DEFAULT_TTL = 30;

  /**
   * 获取分布式锁
   * @param key 锁的键
   * @param ttl 锁超时时间（秒），默认 30 秒
   * @returns 锁标识符（释放时需要），获取失败返回 null
   */
  async acquire(
    key: string,
    ttl = LockService.DEFAULT_TTL,
  ): Promise<string | null> {
    const lockKey = `${LockService.PREFIX}${key}`;
    const lockValue = nanoid(16); // 唯一标识符，防止误释放

    // SET key value NX EX ttl
    const result = await this.redisService.set(
      lockKey,
      lockValue,
      "EX",
      ttl,
      "NX",
    );

    if (result === "OK") {
      return lockValue;
    }
    return null;
  }

  /**
   * 释放分布式锁
   * @param key 锁的键
   * @param lockValue 获取锁时返回的标识符
   * @returns 是否释放成功
   */
  async release(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `${LockService.PREFIX}${key}`;

    // Lua 脚本保证原子性：只有锁的持有者才能释放
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await this.redisService.eval(
        script,
        1,
        lockKey,
        lockValue,
      );
      return result === 1;
    } catch {
      return false;
    }
  }

  /**
   * 带锁执行任务
   * @param key 锁的键
   * @param fn 要执行的异步函数
   * @param ttl 锁超时时间（秒）
   * @returns 函数执行结果
   * @throws 获取锁失败时抛出异常
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttl = LockService.DEFAULT_TTL,
  ): Promise<T> {
    const lockValue = await this.acquire(key, ttl);
    if (!lockValue) {
      throw new Error(`获取锁失败: ${key}，请稍后重试`);
    }

    try {
      return await fn();
    } finally {
      await this.release(key, lockValue);
    }
  }

  /**
   * 尝试获取锁（非阻塞）
   * @param key 锁的键
   * @param ttl 锁超时时间（秒）
   * @returns 是否获取成功
   */
  async tryAcquire(
    key: string,
    ttl = LockService.DEFAULT_TTL,
  ): Promise<boolean> {
    const lockValue = await this.acquire(key, ttl);
    return lockValue !== null;
  }
}
