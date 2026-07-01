import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Query,
  Inject,
  Param,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { AdminService } from "../service/admin.service";
import { MerchantService } from "../service/merchant.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import {
  AdminLoginDTO,
  ReviewMerchantDTO,
  HandleReportDTO,
  CreateAnnouncementDTO,
  CreateBannerDTO,
  UpdateConfigDTO,
} from "../dto/admin.dto";
import { PAGINATION } from "../common/constants";
import { PrismaClient } from "@prisma/client";

@ApiTags("admin")
@Controller("/api/admin")
export class AdminController {
  @Inject()
  adminService!: AdminService;

  @Inject()
  merchantService!: MerchantService;

  @Inject("prisma")
  prisma!: PrismaClient;

  @Public()
  @Post("/login")
  @ApiOperation({ summary: "管理员登录" })
  async login(@Body() body: AdminLoginDTO) {
    const result = await this.adminService.login(body.username, body.password);
    return ResponseUtil.success(result, "登录成功");
  }

  @Get("/dashboard")
  @ApiOperation({ summary: "仪表盘统计" })
  async getDashboard(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const data = await this.adminService.getDashboard();
    return ResponseUtil.success(data);
  }

  @Get("/users")
  @ApiOperation({ summary: "用户列表" })
  async getUsers(
    ctx: Context,
    @Query("keyword") keyword?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.adminService.findUsers({
      keyword,
      page: parsedPage,
      pageSize: parsedPageSize,
    });

    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/users/:id/status")
  @ApiOperation({ summary: "用户状态变更" })
  async updateUserStatus(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    await this.adminService.updateUserStatus(parseInt(id, 10), body.status);
    return ResponseUtil.success(null, "操作成功");
  }

  @Get("/merchants")
  @ApiOperation({ summary: "商家列表" })
  async getMerchants(
    ctx: Context,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.adminService.findMerchants({
      status,
      page: parsedPage,
      pageSize: parsedPageSize,
    });

    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/merchants/:id/review")
  @ApiOperation({ summary: "商家审核" })
  async reviewMerchant(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: ReviewMerchantDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    await this.adminService.reviewMerchant(
      parseInt(id, 10),
      body.action as any,
      user.userId,
      body.reason,
    );
    return ResponseUtil.success(null, "审核完成");
  }

  @Get("/orders")
  @ApiOperation({ summary: "订单列表" })
  async getOrders(
    ctx: Context,
    @Query("status") status?: string,
    @Query("orderType") orderType?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.adminService.findOrders({
      status,
      orderType,
      page: parsedPage,
      pageSize: parsedPageSize,
    });

    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Get("/finance/records")
  @ApiOperation({ summary: "财务记录" })
  async getFinanceRecords(
    ctx: Context,
    @Query("merchantId") merchantId?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.adminService.findFinanceRecords({
      merchantId: merchantId ? parseInt(merchantId, 10) : undefined,
      status,
      page: parsedPage,
      pageSize: parsedPageSize,
    });

    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/finance/:id/settle")
  @ApiOperation({ summary: "结算" })
  async settleFinance(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    await this.adminService.settleFinance(parseInt(id, 10));
    return ResponseUtil.success(null, "结算成功");
  }

  @Get("/reports")
  @ApiOperation({ summary: "举报列表" })
  async getReports(
    ctx: Context,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.adminService.findReports({
      status,
      page: parsedPage,
      pageSize: parsedPageSize,
    });

    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/reports/:id/handle")
  @ApiOperation({ summary: "处理举报" })
  async handleReport(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: HandleReportDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    await this.adminService.handleReport(
      parseInt(id, 10),
      user.userId,
      body.action as any,
      body.result,
    );
    return ResponseUtil.success(null, "处理完成");
  }

  @Public()
  @Get("/announcements")
  @ApiOperation({ summary: "公告列表" })
  async getAnnouncements() {
    const list = await this.adminService.findAnnouncements();
    return ResponseUtil.success(list);
  }

  @Post("/announcements")
  @ApiOperation({ summary: "创建公告" })
  async createAnnouncement(ctx: Context, @Body() body: CreateAnnouncementDTO) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const announcement = await this.adminService.createAnnouncement(body);
    return ResponseUtil.success(announcement, "创建成功");
  }

  @Public()
  @Get("/banners")
  @ApiOperation({ summary: "轮播图列表" })
  async getBanners() {
    const list = await this.adminService.findBanners();
    return ResponseUtil.success(list);
  }

  @Post("/banners")
  @ApiOperation({ summary: "创建轮播图" })
  async createBanner(ctx: Context, @Body() body: CreateBannerDTO) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const banner = await this.adminService.createBanner(body);
    return ResponseUtil.success(banner, "创建成功");
  }

  @Get("/configs")
  @ApiOperation({ summary: "系统配置" })
  async getConfigs(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    const configs = await this.adminService.findConfigs();
    return ResponseUtil.success(configs);
  }

  @Put("/configs")
  @ApiOperation({ summary: "更新配置" })
  async updateConfig(ctx: Context, @Body() body: UpdateConfigDTO) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") {
      return ResponseUtil.error("无权访问", 403);
    }
    await this.adminService.updateConfig(body.key, body.value);
    return ResponseUtil.success(null, "配置已更新");
  }

  @Get("/merchant-applications")
  @ApiOperation({ summary: "商家申请列表" })
  async getMerchantApplications(
    ctx: Context,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.merchantService.findApplications({
      status,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/merchant-applications/:id/review")
  @ApiOperation({ summary: "审核商家申请" })
  async reviewMerchantApplication(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: { action: string; reason?: string },
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    await this.merchantService.reviewApplication(
      parseInt(id, 10),
      body.action as any,
      user.userId,
      body.reason,
    );
    return ResponseUtil.success(null, "审核完成");
  }

  @Get("/logs")
  @ApiOperation({ summary: "操作日志" })
  async getOperationLogs(
    ctx: Context,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const [list, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        include: {
          operator: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (parsedPage - 1) * parsedPageSize,
        take: parsedPageSize,
      }),
      this.prisma.operationLog.count(),
    ]);

    return ResponseUtil.paginate(list, total, parsedPage, parsedPageSize);
  }

  @Get("/recommendations")
  @ApiOperation({ summary: "推荐位列表" })
  async getRecommendations(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    const list = await this.prisma.recommendation.findMany({
      orderBy: { sort: "asc" },
    });
    return ResponseUtil.success(list);
  }

  @Post("/recommendations")
  @ApiOperation({ summary: "创建推荐位" })
  async createRecommendation(
    ctx: Context,
    @Body()
    body: {
      name: string;
      targetType: string;
      targetId: number;
      module?: string;
      sort?: number;
    },
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    const rec = await this.prisma.recommendation.create({
      data: { ...body, sort: body.sort || 0 },
    });
    return ResponseUtil.success(rec, "创建成功");
  }

  @Get("/sensitive-words")
  @ApiOperation({ summary: "敏感词列表" })
  async getSensitiveWords(
    ctx: Context,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const [list, total] = await Promise.all([
      this.prisma.sensitiveWord.findMany({
        orderBy: { createdAt: "desc" },
        skip: (parsedPage - 1) * parsedPageSize,
        take: parsedPageSize,
      }),
      this.prisma.sensitiveWord.count(),
    ]);

    return ResponseUtil.paginate(list, total, parsedPage, parsedPageSize);
  }

  @Post("/sensitive-words")
  @ApiOperation({ summary: "添加敏感词" })
  async addSensitiveWord(
    ctx: Context,
    @Body() body: { word: string; level?: number },
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "ADMIN") return ResponseUtil.error("无权访问", 403);

    const word = await this.prisma.sensitiveWord.create({
      data: { word: body.word, level: body.level || 1 },
    });
    return ResponseUtil.success(word, "添加成功");
  }
}
