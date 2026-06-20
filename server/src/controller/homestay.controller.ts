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
import { HomestayService } from "../service/homestay.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import { BookRoomDTO } from "../dto/homestay.dto";
import { PAGINATION } from "../common/constants";

@ApiTags("homestay")
@Controller("/api/homestays")
export class HomestayController {
  @Inject()
  homestayService!: HomestayService;

  @Public()
  @Get("")
  @ApiOperation({ summary: "民宿列表" })
  async getList(
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

    const result = await this.homestayService.findMany({
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
  @Get("/:id")
  @ApiOperation({ summary: "民宿详情" })
  async getDetail(@Param("id") id: string) {
    const homestay = await this.homestayService.findById(parseInt(id, 10));
    if (!homestay) return ResponseUtil.error("民宿不存在", 404);
    return ResponseUtil.success(homestay);
  }

  @Public()
  @Get("/:id/rooms")
  @ApiOperation({ summary: "房型列表" })
  async getRoomTypes(@Param("id") id: string) {
    const rooms = await this.homestayService.findRoomTypes(parseInt(id, 10));
    return ResponseUtil.success(rooms);
  }

  @Public()
  @Get("/rooms/:roomId/calendar")
  @ApiOperation({ summary: "房态日历" })
  async getRoomCalendar(
    @Param("roomId") roomId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    if (!startDate || !endDate) {
      return ResponseUtil.error("请提供开始和结束日期", 400);
    }
    const calendar = await this.homestayService.findRoomCalendar(
      parseInt(roomId, 10),
      startDate,
      endDate,
    );
    return ResponseUtil.success(calendar);
  }

  @Post("/:id/book")
  @ApiOperation({ summary: "预订房间" })
  async book(ctx: Context, @Param("id") id: string, @Body() body: BookRoomDTO) {
    const user = ctx.state.user as IUserContext;
    const order = await this.homestayService.createBooking({
      ...body,
      userId: user.userId,
    });
    return ResponseUtil.success(order, "预订成功");
  }
}
