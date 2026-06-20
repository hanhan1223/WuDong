import { Catch, MidwayError } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

/** MidwayError code → HTTP status 映射 */
const CODE_TO_STATUS: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * 全局异常过滤器 - 统一错误响应格式
 */
@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    let status = 500;
    let message = err.message || "服务器内部错误";

    if (err instanceof MidwayError) {
      // MidwayError.code → HTTP status
      status = CODE_TO_STATUS[err.code] || 500;
      // 如果 message 是数字字符串（旧代码遗留），使用 code 作为 message
      if (/^\d+$/.test(message)) {
        message = String(err.code) || "服务器内部错误";
      }
    }

    ctx.status = status;
    return {
      code: status,
      message,
      data: null,
    };
  }
}
