import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class SearchService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 搜索商品 */
  async searchProducts(
    keyword: string,
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  ) {
    const where = {
      status: "ACTIVE" as const,
      OR: [
        { title: { contains: keyword } },
        { subtitle: { contains: keyword } },
        { craftIntro: { contains: keyword } },
      ],
    };

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { sales: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 搜索游记 */
  async searchPosts(
    keyword: string,
    page = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  ) {
    const where = {
      status: "NORMAL" as const,
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ],
    };

    const [list, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 记录搜索历史 */
  async recordHistory(userId: number, keyword: string, module?: string) {
    return this.prisma.searchHistory.create({
      data: { userId, keyword, module },
    });
  }

  /** 获取搜索历史 */
  async getHistory(userId: number, limit = 10) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      distinct: ["keyword"],
    });
  }
}
