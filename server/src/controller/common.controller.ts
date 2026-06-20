import {
  Controller,
  Post,
  Get,
  Put,
  Del,
  Body,
  Query,
  Inject,
  Param,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { ReviewService } from "../service/review.service";
import { FavoriteService } from "../service/favorite.service";
import { MessageService } from "../service/message.service";
import { AddressService } from "../service/address.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { PAGINATION } from "../common/constants";
import {
  CreateReviewDTO,
  AppendReviewDTO,
  ReplyReviewDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
  ToggleFavoriteDTO,
} from "../dto/common.dto";

@ApiTags("common")
@Controller("/api")
export class CommonController {
  @Inject()
  reviewService!: ReviewService;

  @Inject()
  favoriteService!: FavoriteService;

  @Inject()
  messageService!: MessageService;

  @Inject()
  addressService!: AddressService;

  // ==================== 评价相关 ====================

  @Post("/reviews")
  @ApiOperation({ summary: "创建评价" })
  async createReview(ctx: Context, @Body() body: CreateReviewDTO) {
    const user = ctx.state.user as IUserContext;
    const review = await this.reviewService.create(user.userId, body as any);
    return ResponseUtil.success(review, "评价成功");
  }

  @Get("/reviews")
  @ApiOperation({ summary: "获取评价列表" })
  async getReviewList(
    @Query("targetType") targetType: string,
    @Query("targetId") targetId: string,
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
    const result = await this.reviewService.findByTarget(
      targetType as any,
      parseInt(targetId, 10),
      parsedPage as any,
      parsedPageSize as any,
    );
    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Post("/reviews/:id/append")
  @ApiOperation({ summary: "追评" })
  async appendReview(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: AppendReviewDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const reviewId = parseInt(id, 10);
    const appended = await this.reviewService.append(
      reviewId,
      user.userId,
      body.content,
    );
    return ResponseUtil.success(appended, "追评成功");
  }

  @Post("/reviews/:id/reply")
  @ApiOperation({ summary: "商家回复评价" })
  async replyReview(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: ReplyReviewDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    if (user.role !== "MERCHANT" && user.role !== "ADMIN") {
      return ResponseUtil.error("仅商家可回复评价", 403);
    }
    const reviewId = parseInt(id, 10);
    const reply = await this.reviewService.reply(
      reviewId,
      user.userId,
      body.content,
    );
    return ResponseUtil.success(reply, "回复成功");
  }

  // ==================== 收藏相关 ====================

  @Post("/favorites")
  @ApiOperation({ summary: "切换收藏状态" })
  async toggleFavorite(ctx: Context, @Body() body: ToggleFavoriteDTO) {
    const user = ctx.state.user as IUserContext;
    const result = await this.favoriteService.toggle(
      user.userId,
      body.targetType as any,
      body.targetId,
    );
    return ResponseUtil.success(result);
  }

  @Get("/favorites")
  @ApiOperation({ summary: "收藏列表" })
  async getFavoriteList(
    ctx: Context,
    @Query("targetType") targetType?: string,
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
    const result = await this.favoriteService.findByUser(
      user.userId,
      targetType as any,
      parsedPage as any,
      parsedPageSize as any,
    );
    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  // ==================== 消息相关 ====================

  @Get("/messages")
  @ApiOperation({ summary: "消息列表" })
  async getMessageList(
    ctx: Context,
    @Query("type") type?: string,
    @Query("isRead") isRead?: string,
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
    const result = await this.messageService.findByUser(
      user.userId,
      type as any,
      isRead !== undefined ? isRead === "true" : undefined,
      parsedPage as any,
      parsedPageSize as any,
    );
    return ResponseUtil.paginate(
      result.list,
      result.total,
      result.page,
      result.pageSize,
    );
  }

  @Put("/messages/:id/read")
  @ApiOperation({ summary: "标记消息已读" })
  async markAsRead(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const messageId = parseInt(id, 10);
    await this.messageService.markAsRead(messageId, user.userId);
    return ResponseUtil.success(null, "已标记为已读");
  }

  @Post("/messages/read-all")
  @ApiOperation({ summary: "全部已读" })
  async markAllAsRead(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    await this.messageService.markAllAsRead(user.userId);
    return ResponseUtil.success(null, "全部已读");
  }

  @Get("/messages/unread-count")
  @ApiOperation({ summary: "未读消息数" })
  async getUnreadCount(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    const count = await this.messageService.getUnreadCount(user.userId);
    return ResponseUtil.success({ count });
  }

  // ==================== 收货地址相关 ====================

  @Get("/addresses")
  @ApiOperation({ summary: "地址列表" })
  async getAddressList(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    const list = await this.addressService.findByUser(user.userId);
    return ResponseUtil.success(list);
  }

  @Post("/addresses")
  @ApiOperation({ summary: "新增地址" })
  async createAddress(ctx: Context, @Body() body: CreateAddressDTO) {
    const user = ctx.state.user as IUserContext;
    const address = await this.addressService.create(user.userId, body);
    return ResponseUtil.success(address, "新增成功");
  }

  @Put("/addresses/:id")
  @ApiOperation({ summary: "更新地址" })
  async updateAddress(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: UpdateAddressDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const addressId = parseInt(id, 10);
    const updated = await this.addressService.update(
      addressId,
      user.userId,
      body,
    );
    return ResponseUtil.success(updated, "更新成功");
  }

  @Del("/addresses/:id")
  @ApiOperation({ summary: "删除地址" })
  async deleteAddress(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const addressId = parseInt(id, 10);
    await this.addressService.delete(addressId, user.userId);
    return ResponseUtil.success(null, "删除成功");
  }

  @Put("/addresses/:id/default")
  @ApiOperation({ summary: "设置默认地址" })
  async setDefaultAddress(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const addressId = parseInt(id, 10);
    await this.addressService.setDefault(addressId, user.userId);
    return ResponseUtil.success(null, "设置成功");
  }
}
