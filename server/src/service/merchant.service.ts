import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, ApplicationStatus } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class MerchantService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 用户提交商家入驻申请 */
  async apply(
    userId: number,
    data: {
      shopName: string;
      module: string;
      contactName: string;
      contactPhone: string;
      licenseNo?: string;
      licenseImage?: string;
      idCardImage?: string;
    },
  ) {
    // 检查是否已有申请
    const existing = await this.prisma.merchantApplication.findFirst({
      where: { userId, status: "PENDING" },
    });
    if (existing) throw new Error("您已有待审核的申请，请等待审核结果");

    return this.prisma.merchantApplication.create({
      data: {
        userId,
        shopName: data.shopName,
        module: data.module as any,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        licenseNo: data.licenseNo,
        licenseImage: data.licenseImage,
        idCardImage: data.idCardImage,
        status: "PENDING",
      },
    });
  }

  /** 查询用户的申请状态 */
  async findByUser(userId: number) {
    return this.prisma.merchantApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /** 管理端：申请列表 */
  async findApplications(params: {
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
      this.prisma.merchantApplication.findMany({
        where,
        include: {
          user: { select: { id: true, phone: true, nickname: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.merchantApplication.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 管理端：审核申请 */
  async reviewApplication(
    applicationId: number,
    action: "APPROVED" | "REJECTED",
    reviewerId: number,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.merchantApplication.findUnique({
        where: { id: applicationId },
      });
      if (!application) throw new Error("申请不存在");
      if (application.status !== "PENDING") throw new Error("该申请已处理");

      // 更新申请状态
      const updated = await tx.merchantApplication.update({
        where: { id: applicationId },
        data: {
          status: action as ApplicationStatus,
          rejectReason: action === "REJECTED" ? reason : null,
          reviewerId,
          reviewedAt: new Date(),
        },
      });

      if (action === "APPROVED") {
        // 创建商家记录
        await tx.merchant.create({
          data: {
            userId: application.userId,
            shopName: application.shopName,
            module: application.module as any,
            contactName: application.contactName,
            contactPhone: application.contactPhone,
            licenseNo: application.licenseNo,
            licenseImage: application.licenseImage,
            idCardImage: application.idCardImage,
            status: "APPROVED",
            settledAt: new Date(),
          },
        });

        // 更新用户角色
        await tx.user.update({
          where: { id: application.userId },
          data: { role: "MERCHANT" },
        });
      }

      return updated;
    });
  }
}
