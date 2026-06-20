import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { PAGINATION } from "../common/constants";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-wudong-jwt-secret";

@Provide()
export class AdminService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 管理员登录 */
  async login(username: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username },
      include: { role: true },
    });
    if (!admin) throw new Error("管理员不存在");
    if (admin.status !== "ACTIVE") throw new Error("账号已被禁用");

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new Error("密码错误");

    // 更新登录时间
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      {
        userId: admin.id,
        role: "ADMIN",
        username: admin.username,
        phone: admin.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role.name,
        permissions: JSON.parse(admin.role.permissions || "[]"),
      },
    };
  }

  /** 仪表盘统计数据 */
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, todayOrders, todayGmv, activeMerchants, pendingReviews] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count({ where: { createdAt: { gte: today } } }),
        this.prisma.order.aggregate({
          where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
          _sum: { totalAmount: true },
        }),
        this.prisma.merchant.count({ where: { status: "APPROVED" } }),
        this.prisma.post.count({ where: { status: "UNDER_REVIEW" } }),
      ]);

    return {
      totalUsers,
      todayOrders,
      todayGmv: Number(todayGmv._sum.totalAmount || 0),
      activeMerchants,
      pendingReviews,
    };
  }

  /** 用户列表（管理） */
  async findUsers(params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      keyword,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = {};
    if (keyword) {
      where.OR = [
        { phone: { contains: keyword } },
        { nickname: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 用户状态变更 */
  async updateUserStatus(userId: number, status: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  }

  /** 商家列表 */
  async findMerchants(params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      status,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = {};
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        include: {
          user: { select: { id: true, phone: true, nickname: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 商家审核 */
  async reviewMerchant(
    merchantId: number,
    action: "APPROVED" | "REJECTED",
    reviewerId: number,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.findUnique({
        where: { id: merchantId },
      });
      if (!merchant) throw new Error("商家不存在");

      const data: any = { status: action };
      if (action === "APPROVED") {
        data.settledAt = new Date();
      }

      // 更新商家状态
      const updated = await tx.merchant.update({
        where: { id: merchantId },
        data,
      });

      // 更新用户角色
      if (action === "APPROVED") {
        await tx.user.update({
          where: { id: merchant.userId },
          data: { role: "MERCHANT" },
        });
      }

      return updated;
    });
  }

  /** 订单列表（管理） */
  async findOrders(params: {
    status?: string;
    orderType?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      status,
      orderType,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = {};
    if (status) where.status = status;
    if (orderType) where.orderType = orderType;

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, phone: true, nickname: true } },
          items: true,
        },
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

  /** 财务记录 */
  async findFinanceRecords(params: {
    merchantId?: number;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      merchantId,
      status,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.financeRecord.findMany({
        where,
        include: { merchant: { select: { id: true, shopName: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.financeRecord.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 结算 */
  async settleFinance(recordId: number) {
    return this.prisma.financeRecord.update({
      where: { id: recordId },
      data: { status: "SETTLED", settledAt: new Date() },
    });
  }

  /** 举报列表 */
  async findReports(params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      status,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = {};
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: { reporter: { select: { id: true, nickname: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 处理举报 */
  async handleReport(
    reportId: number,
    handlerId: number,
    action: "HANDLED" | "REJECTED",
    result?: string,
  ) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action,
        handlerId,
        handleResult: result,
        handledAt: new Date(),
      },
    });
  }

  /** 公告列表 */
  async findAnnouncements() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /** 创建公告 */
  async createAnnouncement(data: { title: string; content: string }) {
    return this.prisma.announcement.create({ data });
  }

  /** 轮播图列表 */
  async findBanners() {
    return this.prisma.banner.findMany({ orderBy: { sort: "asc" } });
  }

  /** 创建轮播图 */
  async createBanner(data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    module?: string;
    sort?: number;
  }) {
    return this.prisma.banner.create({
      data: { ...data, sort: data.sort || 0 },
    });
  }

  /** 系统配置列表 */
  async findConfigs() {
    return this.prisma.systemConfig.findMany();
  }

  /** 更新系统配置 */
  async updateConfig(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
