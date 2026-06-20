import { Controller, Post, Get, Body, Inject, Query } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { MerchantService } from "../service/merchant.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { PAGINATION } from "../common/constants";

@ApiTags("merchant")
@Controller("/api/merchant")
export class MerchantController {
  @Inject()
  merchantService!: MerchantService;

  @Post("/apply")
  @ApiOperation({ summary: "提交商家入驻申请" })
  async apply(
    ctx: Context,
    @Body()
    body: {
      shopName: string;
      module: string;
      contactName: string;
      contactPhone: string;
      licenseNo?: string;
      licenseImage?: string;
      idCardImage?: string;
    },
  ) {
    const user = ctx.state.user as IUserContext;
    const application = await this.merchantService.apply(user.userId, body);
    return ResponseUtil.success(application, "申请已提交，等待审核");
  }

  @Get("/applications")
  @ApiOperation({ summary: "我的申请记录" })
  async getMyApplications(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    const applications = await this.merchantService.findByUser(user.userId);
    return ResponseUtil.success(applications);
  }
}
