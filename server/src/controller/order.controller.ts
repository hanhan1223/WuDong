import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  Param,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { OrderService } from "../service/order.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { CreateOrderDTO, CancelOrderDTO } from "../dto/order.dto";
import { PAGINATION } from "../common/constants";

@ApiTags("order")
@Controller("/api/orders")
export class OrderController {
  @Inject()
  orderService!: OrderService;

  @Post("/create")
  @ApiOperation({ summary: "创建订单" })
  async createOrder(ctx: Context, @Body() body: CreateOrderDTO) {
    const user = ctx.state.user as IUserContext;
    const order = await this.orderService.createOrder({
      userId: user.userId,
      ...body,
    });
    return ResponseUtil.success(order, "下单成功");
  }

  @Get("/list")
  @ApiOperation({ summary: "我的订单列表" })
  async getOrderList(
    ctx: Context,
    @Query("status") status?: string,
    @Query("orderType") orderType?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    // 解析并校验分页参数
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );
    const result = await this.orderService.findByUser(user.userId, {
      status: status as any,
      orderType: orderType as any,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Get("/:id")
  @ApiOperation({ summary: "订单详情" })
  async getOrderDetail(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const order = await this.orderService.findById(parseInt(id, 10));
    if (!order) {
      return ResponseUtil.error("订单不存在", 404);
    }
    if (order.userId !== user.userId && user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问该订单", 403);
    }
    return ResponseUtil.success(order);
  }

  @Post("/:id/cancel")
  @ApiOperation({ summary: "取消订单" })
  async cancelOrder(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: CancelOrderDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const orderId = parseInt(id, 10);
    const order = await this.orderService.findById(orderId);
    if (!order) {
      return ResponseUtil.error("订单不存在", 404);
    }
    if (order.userId !== user.userId) {
      return ResponseUtil.error("无权取消该订单", 403);
    }
    await this.orderService.cancelOrder(orderId, body.reason);
    return ResponseUtil.success(null, "订单已取消");
  }

  @Post("/:id/confirm")
  @ApiOperation({ summary: "确认订单（商家）" })
  async confirmOrder(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "MERCHANT" && user.role !== "ADMIN") {
      return ResponseUtil.error("仅商家可确认订单", 403);
    }
    const orderId = parseInt(id, 10);
    const order = await this.orderService.findById(orderId);
    if (!order) return ResponseUtil.error("订单不存在", 404);
    if (order.status !== "PAID")
      return ResponseUtil.error("订单状态不允许确认", 400);
    const updated = await this.orderService.updateStatus(
      orderId,
      "CONFIRMED" as any,
    );
    return ResponseUtil.success(updated, "订单已确认");
  }

  @Post("/:id/complete")
  @ApiOperation({ summary: "完成订单" })
  async completeOrder(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const orderId = parseInt(id, 10);
    const order = await this.orderService.findById(orderId);
    if (!order) return ResponseUtil.error("订单不存在", 404);
    if (!["CONFIRMED", "IN_PROGRESS"].includes(order.status)) {
      return ResponseUtil.error("订单状态不允许完成", 400);
    }
    const updated = await this.orderService.updateStatus(
      orderId,
      "COMPLETED" as any,
      {
        completedAt: new Date(),
      },
    );
    return ResponseUtil.success(updated, "订单已完成");
  }
}
