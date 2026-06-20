import { Provide, Inject } from "@midwayjs/core";
import {
  PrismaClient,
  Order,
  OrderType,
  OrderStatus,
  MerchantModule,
} from "@prisma/client";
import { nanoid } from "nanoid";
import { PAGINATION, ORDER_STATUS } from "../common/constants";

@Provide()
export class OrderService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 生成订单号 */
  private generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = nanoid(6).toUpperCase();
    return `WD${timestamp}${random}`;
  }

  /** 创建订单 */
  async createOrder(data: {
    userId: number;
    orderType: OrderType;
    module: MerchantModule;
    items: Array<{
      productId?: number;
      productName: string;
      productImage?: string;
      skuId?: number;
      skuName?: string;
      price: number;
      quantity: number;
    }>;
    remark?: string;
  }) {
    // 使用整数分计算避免浮点精度问题，最后转回元
    const totalAmountCents = data.items.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0,
    );
    const totalAmount = Math.round(totalAmountCents) / 100;

    return this.prisma.order.create({
      data: {
        orderNo: this.generateOrderNo(),
        userId: data.userId,
        orderType: data.orderType,
        module: data.module,
        totalAmount,
        remark: data.remark,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            skuId: item.skuId,
            skuName: item.skuName,
            price: item.price,
            quantity: item.quantity,
            subtotal: (Math.round(item.price * 100) * item.quantity) / 100,
          })),
        },
      },
      include: { items: true },
    });
  }

  /** 根据ID查找订单 */
  async findById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true, refund: true },
    });
  }

  /** 根据订单号查找订单 */
  async findByOrderNo(orderNo: string) {
    return this.prisma.order.findUnique({
      where: { orderNo },
      include: { items: true, payment: true, refund: true },
    });
  }

  /** 用户订单列表 */
  async findByUser(
    userId: number,
    params: {
      status?: OrderStatus;
      orderType?: OrderType;
      page?: number;
      pageSize?: number;
    },
  ) {
    const {
      status,
      orderType,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;

    const where = {
      userId,
      ...(status && { status }),
      ...(orderType && { orderType }),
    };

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 更新订单状态 */
  async updateStatus(
    id: number,
    status: OrderStatus,
    extra?: Record<string, any>,
  ) {
    return this.prisma.order.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  /** 取消订单 */
  async cancelOrder(id: number, reason: string) {
    return this.updateStatus(id, ORDER_STATUS.CANCELLED as OrderStatus, {
      cancelReason: reason,
      cancelTime: new Date(),
    });
  }

  /** 支付成功回调 */
  async paySuccess(orderId: number, tradeNo: string, payAmount: number) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, status: ORDER_STATUS.PENDING_PAYMENT },
        data: {
          status: ORDER_STATUS.PAID as OrderStatus,
          payAmount,
          payTime: new Date(),
          tradeNo,
        },
      });
      if (result.count === 0) {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });
        if (!order) throw new Error("订单不存在");
        return order; // Already paid or cancelled
      }
      // Create payment record
      await tx.payment.create({
        data: {
          orderId,
          amount: payAmount,
          method: "wechat",
          tradeNo,
          status: "SUCCESS",
          paidAt: new Date(),
        },
      });
      return tx.order.findUnique({ where: { id: orderId } });
    });
  }
}
