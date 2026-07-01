import { createCustomMethodDecorator } from "@midwayjs/core";

/**
 * 标记接口为公开访问（无需 JWT Token）
 * 会在 JwtGuard 中被检查
 */
export const PUBLIC_KEY = "decorator:public";

export function Public(): MethodDecorator {
  return createCustomMethodDecorator(PUBLIC_KEY, {});
}
