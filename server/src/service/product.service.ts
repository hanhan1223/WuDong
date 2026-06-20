import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class ProductService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 商品列表（分页+筛选+搜索） */
  async findMany(params: {
    categoryId?: number;
    merchantId?: number;
    status?: ProductStatus;
    keyword?: string;
    page?: number;
    pageSize?: number;
    orderBy?: "price" | "sales" | "createdAt";
    order?: "asc" | "desc";
  }) {
    const {
      categoryId,
      merchantId,
      status,
      keyword,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
      orderBy = "createdAt",
      order = "desc",
    } = params;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { subtitle: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } }, skus: true },
        orderBy: { [orderBy]: order },
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

  /** 商品详情 */
  async findById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        skus: true,
        images: { orderBy: { sort: "asc" } },
        merchant: { select: { id: true, shopName: true } },
      },
    });
  }

  /** 分类树 */
  async getCategories() {
    return this.prisma.productCategory.findMany({
      where: { status: true },
      orderBy: { sort: "asc" },
      include: {
        children: { where: { status: true }, orderBy: { sort: "asc" } },
      },
    });
  }

  /** 热门商品（按销量排序） */
  async findHot(limit = 10) {
    return this.prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sales: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        mainImage: true,
        price: true,
        sales: true,
      },
    });
  }

  /** 创建商品 */
  async create(data: {
    categoryId: number;
    merchantId: number;
    title: string;
    subtitle?: string;
    mainImage: string;
    price: number;
    marketPrice?: number;
    stock?: number;
    detail?: string;
    craftIntro?: string;
    artisanName?: string;
    artisanStory?: string;
    skus?: Array<{
      specName: string;
      price: number;
      stock?: number;
      image?: string;
    }>;
  }) {
    return this.prisma.product.create({
      data: {
        categoryId: data.categoryId,
        merchantId: data.merchantId,
        title: data.title,
        subtitle: data.subtitle,
        mainImage: data.mainImage,
        price: data.price,
        marketPrice: data.marketPrice,
        stock: data.stock || 0,
        detail: data.detail,
        craftIntro: data.craftIntro,
        artisanName: data.artisanName,
        artisanStory: data.artisanStory,
        status: "DRAFT",
        skus: data.skus ? { create: data.skus } : undefined,
      },
      include: { skus: true },
    });
  }

  /** 更新商品 */
  async update(id: number, merchantId: number, data: any) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("商品不存在");
    if (product.merchantId !== merchantId) throw new Error("无权修改该商品");

    return this.prisma.product.update({
      where: { id },
      data,
      include: { skus: true },
    });
  }

  /** 删除商品 */
  async delete(id: number, merchantId: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("商品不存在");
    if (product.merchantId !== merchantId) throw new Error("无权删除该商品");

    return this.prisma.product.delete({ where: { id } });
  }

  /** 更新商品状态（上架/下架） */
  async updateStatus(id: number, merchantId: number, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("商品不存在");
    if (product.merchantId !== merchantId) throw new Error("无权操作该商品");

    return this.prisma.product.update({
      where: { id },
      data: { status },
    });
  }
}
