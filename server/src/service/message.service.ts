import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, MessageType } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class MessageService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 创建消息 */
  async create(
    userId: number,
    type: MessageType,
    title: string,
    content: string,
  ) {
    return this.prisma.message.create({
      data: {
        userId,
        type,
        title,
        content,
      },
    });
  }

  /** 消息列表 */
  async findByUser(
    userId: number,
    type?: MessageType,
    isRead?: boolean,
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  ) {
    const where = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead }),
    };

    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 标记已读 */
  async markAsRead(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("消息不存在");
    }
    if (message.userId !== userId) {
      throw new Error("无权操作此消息");
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  /** 全部标记已读 */
  async markAllAsRead(userId: number) {
    return this.prisma.message.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  /** 未读消息数 */
  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.message.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
