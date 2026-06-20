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
import { RestaurantService } from "../service/restaurant.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import { CreateBookingDTO } from "../dto/restaurant.dto";
import { PAGINATION } from "../common/constants";

@ApiTags("restaurant")
@Controller("/api/restaurants")
export class RestaurantController {
  @Inject()
  restaurantService!: RestaurantService;

  @Public()
  @Get("")
  @ApiOperation({ summary: "餐厅列表" })
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

    const result = await this.restaurantService.findMany({
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
  @ApiOperation({ summary: "餐厅详情" })
  async getDetail(@Param("id") id: string) {
    const restaurant = await this.restaurantService.findById(parseInt(id, 10));
    if (!restaurant) return ResponseUtil.error("餐厅不存在", 404);
    return ResponseUtil.success(restaurant);
  }

  @Public()
  @Get("/:id/dishes")
  @ApiOperation({ summary: "菜品列表" })
  async getDishes(@Param("id") id: string) {
    const dishes = await this.restaurantService.findDishes(parseInt(id, 10));
    return ResponseUtil.success(dishes);
  }

  @Public()
  @Get("/:id/timeslots")
  @ApiOperation({ summary: "可预订时段" })
  async getTimeSlots(@Param("id") id: string) {
    const slots = await this.restaurantService.findTimeSlots(parseInt(id, 10));
    return ResponseUtil.success(slots);
  }

  @Post("/:id/book")
  @ApiOperation({ summary: "预订餐位" })
  async book(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: CreateBookingDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const booking = await this.restaurantService.createBooking({
      restaurantId: parseInt(id, 10),
      userId: user.userId,
      bookingDate: new Date(body.bookingDate),
      timeSlotId: body.timeSlotId,
      guestCount: body.guestCount,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      remark: body.remark,
    });
    return ResponseUtil.success(booking, "预订成功");
  }
}

@ApiTags("booking")
@Controller("/api/bookings")
export class BookingController {
  @Inject()
  restaurantService!: RestaurantService;

  @Get("")
  @ApiOperation({ summary: "我的预订列表" })
  async getMyBookings(
    ctx: Context,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = ctx.state.user as IUserContext;
    const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
    const parsedPageSize = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(pageSize || String(PAGINATION.DEFAULT_PAGE_SIZE), 10) ||
          PAGINATION.DEFAULT_PAGE_SIZE,
      ),
    );

    const result = await this.restaurantService.findBookingsByUser(
      user.userId,
      parsedPage,
      parsedPageSize,
    );

    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/:id/cancel")
  @ApiOperation({ summary: "取消预订" })
  async cancelBooking(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    await this.restaurantService.cancelBooking(parseInt(id, 10), user.userId);
    return ResponseUtil.success(null, "预订已取消");
  }
}

@ApiTags("farm")
@Controller("/api/farm")
export class FarmController {
  @Inject()
  restaurantService!: RestaurantService;

  @Public()
  @Get("/categories")
  @ApiOperation({ summary: "农产品分类" })
  async getCategories() {
    const categories = await this.restaurantService.findFarmCategories();
    return ResponseUtil.success(categories);
  }

  @Public()
  @Get("/products")
  @ApiOperation({ summary: "农产品列表" })
  async getProducts(
    @Query("categoryId") categoryId?: string,
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

    const result = await this.restaurantService.findFarmProducts({
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
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
  @Get("/products/:id")
  @ApiOperation({ summary: "农产品详情" })
  async getProductDetail(@Param("id") id: string) {
    const product = await this.restaurantService.findFarmProductById(
      parseInt(id, 10),
    );
    if (!product) return ResponseUtil.error("产品不存在", 404);
    return ResponseUtil.success(product);
  }
}
