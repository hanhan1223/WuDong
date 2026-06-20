import { Guard, IGuard, MidwayError } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "../interface";

/** 不需要鉴权的公开路径（POST 登录/注册） */
const PUBLIC_POST_PATHS = [
  "/api/users/login",
  "/api/users/register",
  "/api/admin/login",
];

/** GET 请求公开的路径前缀（浏览类接口） */
const PUBLIC_GET_PREFIXES = [
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
];

/** JWT 密钥（与 config 保持一致） */
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-wudong-jwt-secret";

/**
 * JWT 鉴权守卫
 */
@Guard()
export class JwtGuard implements IGuard {
  async canActivate(ctx: Context): Promise<boolean> {
    // Swagger 文档放行
    if (ctx.path.startsWith("/swagger") || ctx.path.startsWith("/doc")) {
      return true;
    }

    // POST 登录/注册接口放行
    if (
      ctx.method === "POST" &&
      PUBLIC_POST_PATHS.some((p) => ctx.path === p)
    ) {
      return true;
    }

    // GET 请求的公开浏览接口放行
    if (
      ctx.method === "GET" &&
      PUBLIC_GET_PREFIXES.some((p) => ctx.path.startsWith(p))
    ) {
      return true;
    }

    // 从 Header 获取 Token
    const authHeader = ctx.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) {
      throw new MidwayError("请先登录", "UNAUTHORIZED");
    }

    try {
      // 直接用 jsonwebtoken 验证
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // 将用户信息挂载到 ctx.state
      ctx.state.user = {
        userId: payload.userId,
        role: payload.role,
        phone: payload.phone,
      };

      return true;
    } catch (err) {
      throw new MidwayError("登录已过期，请重新登录", "UNAUTHORIZED");
    }
  }
}
