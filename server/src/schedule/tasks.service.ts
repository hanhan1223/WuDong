import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";

@Provide()
export class TasksService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 每天凌晨 2 点：自动完成已确认超过 7 天的订单 */
  // @Schedule({ type: "cron", cron: "0 2 * * *" })
  async autoCompleteOrders() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.prisma.order.updateMany({
      where: {
        status: "CONFIRMED",
        updatedAt: { lt: sevenDaysAgo },
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    if (result.count > 0) {
      console.log(`[定时任务] 自动完成 ${result.count} 个订单`);
    }
  }

  /** 每天凌晨 3 点：过期未使用的电子票 */
  // @Schedule({ type: "cron", cron: "0 3 * * *" })
  async expireTickets() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.eTicket.updateMany({
      where: {
        status: "UNUSED",
        validDate: { lt: today },
      },
      data: { status: "EXPIRED" },
    });

    if (result.count > 0) {
      console.log(`[定时任务] 过期 ${result.count} 张电子票`);
    }
  }

  /** 每天凌晨 4 点：T+7 自动结算 */
  // @Schedule({ type: "cron", cron: "0 4 * * *" })
  async autoSettle() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.prisma.financeRecord.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: sevenDaysAgo },
      },
      data: {
        status: "SETTLED",
        settledAt: new Date(),
      },
    });

    if (result.count > 0) {
      console.log(`[定时任务] 自动结算 ${result.count} 条财务记录`);
    }
  }

  /** 每小时：解除 24 小时禁言 */
  // @Schedule({ type: "cron", cron: "0 * * * *" })
  async unmuteUsers() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const mutedUsers = await this.prisma.user.findMany({
      where: {
        status: "MUTED",
        updatedAt: { lt: twentyFourHoursAgo },
      },
    });

    if (mutedUsers.length > 0) {
      await this.prisma.user.updateMany({
        where: { id: { in: mutedUsers.map((u) => u.id) } },
        data: { status: "ACTIVE" },
      });
      console.log(`[定时任务] 解除 ${mutedUsers.length} 个用户禁言`);
    }
  }
}
