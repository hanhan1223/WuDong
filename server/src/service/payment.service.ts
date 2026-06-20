import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, PaymentStatus } from "@prisma/client";
import { nanoid } from "nanoid";

@Provide()
export class PaymentService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 创建支付单（预支付） */
  async createPayment(orderId: number, method: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("订单不存在");
    if (order.status !== "PENDING_PAYMENT")
      throw new Error("订单状态不允许支付");

    // 检查是否已有支付单
    const existing = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (existing && existing.status === "PENDING") {
      return existing;
    }

    return this.prisma.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        method,
        status: "PENDING",
      },
    });
  }

  /** 支付成功回调 */
  async handlePaySuccess(orderId: number, tradeNo: string) {
    return this.prisma.$transaction(async (tx) => {
      // 更新支付单
      const payment = await tx.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", tradeNo, paidAt: new Date() },
      });

      // 更新订单状态
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          payAmount: payment.amount,
          payTime: new Date(),
          payMethod: payment.method,
          tradeNo,
        },
      });

      return payment;
    });
  }

  /** 退款 */
  async refund(orderId: number, amount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("订单不存在");
      if (!["PAID", "CONFIRMED", "IN_PROGRESS"].includes(order.status)) {
        throw new Error("订单状态不允许退款");
      }

      // 创建退款记录
      const refund = await tx.refund.create({
        data: { orderId, amount, reason, status: "PENDING" },
      });

      // 更新订单状态
      await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDING" },
      });

      return refund;
    });
  }

  /** 退款成功回调 */
  async handleRefundSuccess(orderId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.refund.update({
        where: { orderId },
        data: { status: "COMPLETED", refundedAt: new Date() },
      });

      await tx.payment.update({
        where: { orderId },
        data: { status: "REFUNDED" },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });
    });
  }

  /** 查询支付单 */
  async findByOrderId(orderId: number) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }
}
