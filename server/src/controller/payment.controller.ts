import { Controller, Post, Get, Body, Inject, Param } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { PaymentService } from "../service/payment.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";

@ApiTags("payment")
@Controller("/api/payments")
export class PaymentController {
  @Inject()
  paymentService!: PaymentService;

  @Post("/create")
  @ApiOperation({ summary: "创建支付单" })
  async createPayment(
    ctx: Context,
    @Body() body: { orderId: number; method: string },
  ) {
    const user = ctx.state.user as IUserContext;
    const payment = await this.paymentService.createPayment(
      body.orderId,
      body.method,
    );
    return ResponseUtil.success(payment, "支付单已创建");
  }

  @Post("/callback")
  @ApiOperation({ summary: "支付回调（模拟）" })
  async payCallback(@Body() body: { orderId: number; tradeNo: string }) {
    const payment = await this.paymentService.handlePaySuccess(
      body.orderId,
      body.tradeNo,
    );
    return ResponseUtil.success(payment, "支付成功");
  }

  @Post("/refund")
  @ApiOperation({ summary: "申请退款" })
  async refund(
    ctx: Context,
    @Body() body: { orderId: number; amount: number; reason: string },
  ) {
    const user = ctx.state.user as IUserContext;
    const refund = await this.paymentService.refund(
      body.orderId,
      body.amount,
      body.reason,
    );
    return ResponseUtil.success(refund, "退款申请已提交");
  }

  @Get("/:orderId")
  @ApiOperation({ summary: "查询支付状态" })
  async getPayment(@Param("orderId") orderId: string) {
    const payment = await this.paymentService.findByOrderId(
      parseInt(orderId, 10),
    );
    if (!payment) return ResponseUtil.error("支付单不存在", 404);
    return ResponseUtil.success(payment);
  }
}
