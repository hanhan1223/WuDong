import { Guard, IGuard, MidwayError } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import * as jwt from "jsonwebtoken";
import "reflect-metadata";
import { JwtPayload } from "../interface";
import { PUBLIC_KEY } from "../decorator/public.decorator";

/**
 * JWT 鉴权守卫
 * 优先级：
 * 1. Swagger 文档路径 → 放行
 * 2. 方法上有 @Public() 装饰器 → 放行
 * 3. 请求头有合法 Bearer Token → 放行
 * 4. 否则 → 拒绝
 */
@Guard()
export class JwtGuard implements IGuard {
  async canActivate(
    ctx: Context,
    clz: new (...args: any[]) => any,
    methodName: string,
  ): Promise<boolean> {
    // 1. Swagger 文档放行
    if (ctx.path.startsWith("/swagger") || ctx.path.startsWith("/doc")) {
      return true;
    }

    // 2. 检查 @Public() 装饰器（通过 Reflect 元数据）
    if (clz && methodName) {
      const metadata = Reflect.getMetadata(PUBLIC_KEY, clz);
      if (metadata && methodName in metadata) {
        return true;
      }
    }

    // 2b. 兜底：常用公开路径前缀（兼容 clz/methodName 不可用的场景）
    const PUBLIC_PREFIXES = [
      "/api/health",
      "/api/products",
      "/api/restaurants",
      "/api/farm",
      "/api/homestays",
      "/api/scenic-spots",
      "/api/routes",
      "/api/transport-guides",
      "/api/e-tickets",
      "/api/posts",
      "/api/topics",
      "/api/search",
    ];
    if (
      ctx.method === "GET" &&
      PUBLIC_PREFIXES.some((p) => ctx.path.startsWith(p))
    ) {
      return true;
    }

    // 3. 从 Header 获取 Token 并验证
    const authHeader = ctx.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      throw new MidwayError("请先登录", "UNAUTHORIZED");
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "wudong-tourism-jwt-secret-2026",
      ) as JwtPayload;

      // 将用户信息挂载到 ctx.state
      ctx.state.user = {
        userId: payload.userId,
        role: payload.role,
        phone: payload.phone,
      };

      return true;
    } catch (_err) {
      throw new MidwayError("登录已过期，请重新登录", "UNAUTHORIZED");
    }
  }
}
