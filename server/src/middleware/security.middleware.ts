import { Middleware, IMiddleware } from "@midwayjs/core";
import { Context, NextFunction } from "@midwayjs/koa";

/**
 * 安全中间件 - XSS 防护 + CSRF 防护 + 安全头
 */
@Middleware()
export class SecurityMiddleware implements IMiddleware<Context, NextFunction> {
  private sanitizeHtmlFields(body: any): void {
    if (!body || typeof body !== "object") return;
    const htmlFields = [
      "content",
      "title",
      "introduction",
      "detail",
      "bio",
      "notes",
      "replyContent",
      "appendContent",
    ];
    for (const key of Object.keys(body)) {
      if (htmlFields.includes(key) && typeof body[key] === "string") {
        body[key] = body[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    }
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // === 安全响应头 ===
      ctx.set("X-Content-Type-Options", "nosniff");
      ctx.set("X-Frame-Options", "DENY");
      ctx.set("X-XSS-Protection", "1; mode=block");
      ctx.set("Referrer-Policy", "strict-origin-when-cross-origin");

      // === CSRF 防护 ===
      // 对于状态变更请求（POST/PUT/DELETE/PATCH），验证 Origin 或 Referer
      if (["POST", "PUT", "DELETE", "PATCH"].includes(ctx.method)) {
        const origin = ctx.headers.origin || ctx.headers.referer;
        if (!origin) {
          // Allow public auth endpoints without origin
          const publicPaths = [
            "/api/users/login",
            "/api/users/register",
            "/api/admin/login",
          ];
          if (!publicPaths.some((p) => ctx.path.startsWith(p))) {
            ctx.status = 403;
            return { code: 403, message: "缺少请求来源", data: null };
          }
        } else {
          const allowedOrigins = [
            process.env.CORS_ORIGIN || "http://localhost:8080",
            "http://localhost:7001",
            "http://localhost:3000",
          ];
          const originUrl = new URL(origin);
          const isAllowed = allowedOrigins.some(
            (allowed) => originUrl.origin === allowed,
          );
          if (!isAllowed) {
            ctx.status = 403;
            return { code: 403, message: "CSRF 验证失败", data: null };
          }
        }
      }

      // === XSS 防护 - 仅清洗用户生成的 HTML 字段 ===
      this.sanitizeHtmlFields(ctx.request.body);

      return next();
    };
  }
}
