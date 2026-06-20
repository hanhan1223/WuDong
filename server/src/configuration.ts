import "dotenv/config";
import { Configuration, App } from "@midwayjs/core";
import * as koa from "@midwayjs/koa";
import * as validate from "@midwayjs/validate";
import * as jwt from "@midwayjs/jwt";
import * as redis from "@midwayjs/redis";
import * as swagger from "@midwayjs/swagger";
import * as info from "@midwayjs/info";
import { join } from "path";
import { DefaultErrorFilter } from "./filter/default.filter";
import { NotFoundFilter } from "./filter/notfound.filter";
import { JwtGuard } from "./guard/jwt.guard";
import { ReportMiddleware } from "./middleware/report.middleware";
import { RateLimitMiddleware } from "./middleware/rateLimit.middleware";
import { SecurityMiddleware } from "./middleware/security.middleware";

@Configuration({
  imports: [koa, validate, jwt, redis, swagger, info],
  importConfigs: [join(__dirname, "./config")],
})
export class ContainerLifeCycle {
  @App()
  app!: koa.Application;

  async onReady() {
    // 注册全局异常过滤器
    this.app.useFilter([DefaultErrorFilter, NotFoundFilter]);

    // 注册全局中间件（顺序：安全 → 限流 → 日志）
    this.app.useMiddleware([
      SecurityMiddleware,
      RateLimitMiddleware,
      ReportMiddleware,
    ]);

    // 注册全局守卫
    this.app.useGuard([JwtGuard]);

    // 启动定时任务
    try {
      const tasksService: any = await this.app
        .getApplicationContext()
        .getAsync("tasksService");
      // 每 24 小时：自动完成已确认超过 7 天的订单
      setInterval(() => tasksService.autoCompleteOrders(), 24 * 60 * 60 * 1000);
      // 每 24 小时：过期未使用的电子票
      setInterval(() => tasksService.expireTickets(), 24 * 60 * 60 * 1000);
      // 每 24 小时：T+7 自动结算
      setInterval(() => tasksService.autoSettle(), 24 * 60 * 60 * 1000);
      // 每小时：解除 24 小时禁言
      setInterval(() => tasksService.unmuteUsers(), 60 * 60 * 1000);
      console.log("[定时任务] 已启动");
    } catch (err) {
      console.error("[定时任务] 启动失败:", err);
    }
  }
}
