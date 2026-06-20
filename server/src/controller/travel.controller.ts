import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  Param,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { TravelService } from "../service/travel.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import { BuyTicketDTO } from "../dto/travel.dto";
import { PAGINATION } from "../common/constants";

@ApiTags("travel")
@Controller("/api")
export class TravelController {
  @Inject()
  travelService!: TravelService;

  @Public()
  @Get("/scenic-spots")
  @ApiOperation({ summary: "景区列表" })
  async getScenicSpots(
    @Query("keyword") keyword?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.travelService.findScenicSpots({
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

  @Public()
  @Get("/scenic-spots/:id")
  @ApiOperation({ summary: "景区详情" })
  async getScenicSpotDetail(@Param("id") id: string) {
    const spot = await this.travelService.findScenicSpotById(parseInt(id, 10));
    if (!spot) return ResponseUtil.error("景区不存在", 404);
    return ResponseUtil.success(spot);
  }

  @Public()
  @Get("/scenic-spots/:id/tickets")
  @ApiOperation({ summary: "票种列表" })
  async getTickets(@Param("id") id: string) {
    const spot = await this.travelService.findScenicSpotById(parseInt(id, 10));
    if (!spot) return ResponseUtil.error("景区不存在", 404);
    return ResponseUtil.success(spot.ticketTypes);
  }

  @Public()
  @Get("/routes")
  @ApiOperation({ summary: "路线套餐列表" })
  async getRoutes(
    @Query("keyword") keyword?: string,
    @Query("theme") theme?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.travelService.findRoutes({
      keyword,
      theme,
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

  @Public()
  @Get("/routes/:id")
  @ApiOperation({ summary: "路线详情" })
  async getRouteDetail(@Param("id") id: string) {
    const route = await this.travelService.findRouteById(parseInt(id, 10));
    if (!route) return ResponseUtil.error("路线不存在", 404);
    return ResponseUtil.success(route);
  }

  @Public()
  @Get("/transport-guides")
  @ApiOperation({ summary: "交通攻略" })
  async getTransportGuides() {
    const guides = await this.travelService.findTransportGuides();
    return ResponseUtil.success(guides);
  }

  @Public()
  @Get("/e-tickets/:code")
  @ApiOperation({ summary: "电子票查询" })
  async getETicket(@Param("code") code: string) {
    const ticket = await this.travelService.findETicketByCode(code);
    if (!ticket) return ResponseUtil.error("电子票不存在", 404);
    return ResponseUtil.success(ticket);
  }

  @Post("/tickets/buy")
  @ApiOperation({ summary: "购买门票" })
  async buyTicket(ctx: Context, @Body() body: BuyTicketDTO) {
    const user = ctx.state.user as IUserContext;
    const order = await this.travelService.createTicketOrder({
      ...body,
      userId: user.userId,
    });
    return ResponseUtil.success(order, "购票成功");
  }
}
