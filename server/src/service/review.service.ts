import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, ReviewTarget, ReviewStatus } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class ReviewService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 创建评价 */
  async create(
    userId: number,
    data: {
      targetType: ReviewTarget;
      targetId: number;
      orderId?: number;
      rating: number;
      content?: string;
      images?: string[];
    },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("评分必须在1-5之间");
    }

    return this.prisma.review.create({
      data: {
        userId,
        targetType: data.targetType,
        targetId: data.targetId,
        orderId: data.orderId,
        rating: data.rating,
        content: data.content,
        images: data.images ? JSON.stringify(data.images) : null,
      },
    });
  }

  /** 查询目标的评价列表 */
  async findByTarget(
    targetType: ReviewTarget,
    targetId: number,
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  ) {
    const where = {
      targetType,
      targetId,
      status: ReviewStatus.NORMAL,
    };

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 用户的评价列表 */
  async findByUser(
    userId: number,
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  ) {
    const where = {
      userId,
      status: { not: ReviewStatus.DELETED },
    };

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 追评 */
  async append(reviewId: number, userId: number, content: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error("评价不存在");
    }
    if (review.userId !== userId) {
      throw new Error("无权操作此评价");
    }
    if (review.appendContent) {
      throw new Error("已追评，不可重复追评");
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        appendContent: content,
        appendTime: new Date(),
      },
    });
  }

  /** 商家回复 */
  async reply(reviewId: number, merchantId: number, content: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error("评价不存在");
    }

    // 校验商家是否拥有该评价对应的业务目标
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId: merchantId },
    });
    if (!merchant) {
      throw new Error("商家不存在");
    }

    let isOwner = false;
    switch (review.targetType) {
      case ReviewTarget.PRODUCT:
        isOwner = !!(await this.prisma.product.findFirst({
          where: { id: review.targetId, merchantId: merchant.id },
        }));
        break;
      case ReviewTarget.RESTAURANT:
        isOwner = !!(await this.prisma.restaurant.findFirst({
          where: { id: review.targetId, merchantId: merchant.id },
        }));
        break;
      case ReviewTarget.HOMESTAY:
        isOwner = !!(await this.prisma.homestay.findFirst({
          where: { id: review.targetId, merchantId: merchant.id },
        }));
        break;
      default:
        break;
    }

    if (!isOwner) {
      throw new Error("无权回复此评价");
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        replyContent: content,
        replyTime: new Date(),
      },
    });
  }
}
