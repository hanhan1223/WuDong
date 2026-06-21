import { Middleware, IMiddleware, Inject } from "@midwayjs/core";
import { Context, NextFunction } from "@midwayjs/koa";
import { RedisService } from "@midwayjs/redis";

/**
 * 限流中间件 - 基于 Redis 的滑动窗口限流
 * 防止 API 滥用和暴力破解
 */
@Middleware()
export class RateLimitMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  redisService!: RedisService;

  /** 默认配置 */
  private static readonly DEFAULT_WINDOW_MS = 60 * 1000; // 1 分钟窗口
  private static readonly DEFAULT_MAX_REQUESTS = 60; // 每窗口最大请求数
  private static readonly LOGIN_MAX_REQUESTS = 10; // 登录接口每分钟最多 10 次
  private static readonly REGISTER_MAX_REQUESTS = 5; // 注册接口每分钟最多 5 次

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const path = ctx.path;
      const ip = ctx.ip || ctx.headers["x-forwarded-for"] || "unknown";

      // 根据接口类型选择限流配置
      let maxRequests = RateLimitMiddleware.DEFAULT_MAX_REQUESTS;
      const windowMs = RateLimitMiddleware.DEFAULT_WINDOW_MS;

      if (path.includes("/login")) {
        maxRequests = RateLimitMiddleware.LOGIN_MAX_REQUESTS;
      } else if (path.includes("/register")) {
        maxRequests = RateLimitMiddleware.REGISTER_MAX_REQUESTS;
      }

      // 生成限流键
      const key = `rate:${ip}:${path}`;

      try {
        // 获取当前窗口的请求计数
        const current = await this.redisService.get(key);
        const count = current ? parseInt(current, 10) : 0;

        if (count >= maxRequests) {
          ctx.status = 429;
          return {
            code: 429,
            message: "请求过于频繁，请稍后再试",
            data: null,
          };
        }

        // 递增计数并设置过期
        await this.redisService.incr(key);
        if (count === 0) {
          await this.redisService.expire(key, Math.ceil(windowMs / 1000));
        }

        // 设置响应头
        ctx.set("X-RateLimit-Limit", String(maxRequests));
        ctx.set("X-RateLimit-Remaining", String(maxRequests - count - 1));
      } catch (err) {
        // Redis 不可用时降级放行
        ctx.logger.warn("Rate limit Redis error:", err);
      }

      return next();
    };
  }
}
