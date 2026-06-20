import { Catch } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

/**
 * 404 异常过滤器
 */
@Catch(404)
export class NotFoundFilter {
  async catch(err: Error, ctx: Context) {
    ctx.status = 404;
    return {
      code: 404,
      message: `接口 ${ctx.path} 不存在`,
      data: null,
    };
  }
}
