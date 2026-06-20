import { Middleware, IMiddleware } from "@midwayjs/core";
import { Context, NextFunction } from "@midwayjs/koa";

/**
 * 完整请求/响应日志中间件
 * 记录请求参数、响应状态、耗时，满足全链路日志要求
 */
@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      const { method, path, query, headers } = ctx;
      const ip = ctx.ip || headers["x-forwarded-for"] || "unknown";
      const userId = (ctx.state.user as any)?.userId || "anonymous";

      // 请求日志
      ctx.logger.info(
        `[REQ] ${method} ${path} | ip=${ip} user=${userId} query=${JSON.stringify(query)}`,
      );

      try {
        const result = await next();
        const duration = Date.now() - startTime;

        ctx.set("X-Response-Time", `${duration}ms`);

        // 响应日志
        ctx.logger.info(
          `[RES] ${method} ${path} | status=${ctx.status} duration=${duration}ms`,
        );

        // 慢请求警告 (>500ms)
        if (duration > 500) {
          ctx.logger.warn(
            `[SLOW] ${method} ${path} - ${duration}ms (threshold: 500ms)`,
          );
        }

        return result;
      } catch (err: any) {
        const duration = Date.now() - startTime;
        ctx.logger.error(
          `[ERR] ${method} ${path} | status=${ctx.status || 500} duration=${duration}ms error=${err.message}`,
          err,
        );
        throw err;
      }
    };
  }
}
