import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, FavoriteTarget } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class FavoriteService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 切换收藏状态（事务保证原子性） */
  async toggle(userId: number, targetType: FavoriteTarget, targetId: number) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.favorite.findUnique({
        where: {
          userId_targetType_targetId: { userId, targetType, targetId },
        },
      });

      if (existing) {
        await tx.favorite.delete({ where: { id: existing.id } });
        return { isFavorited: false };
      }

      await tx.favorite.create({ data: { userId, targetType, targetId } });
      return { isFavorited: true };
    });
  }

  /** 用户的收藏列表 */
  async findByUser(
    userId: number,
    targetType?: FavoriteTarget,
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  ) {
    const where = {
      userId,
      ...(targetType && { targetType }),
    };

    const [list, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.favorite.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 检查是否已收藏 */
  async checkFavorited(
    userId: number,
    targetType: FavoriteTarget,
    targetId: number,
  ): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
    });
    return favorite !== null;
  }
}
