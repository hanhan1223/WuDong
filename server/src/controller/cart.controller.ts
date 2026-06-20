import {
  Controller,
  Post,
  Get,
  Del,
  Body,
  Inject,
  Param,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { CartService } from "../service/cart.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";

@ApiTags("cart")
@Controller("/api/cart")
export class CartController {
  @Inject()
  cartService!: CartService;

  @Post("/add")
  @ApiOperation({ summary: "添加到购物车" })
  async addToCart(
    ctx: Context,
    @Body() body: { productId: number; skuId?: number; quantity?: number },
  ) {
    const user = ctx.state.user as IUserContext;
    const item = await this.cartService.addItem(
      user.userId,
      body.productId,
      body.skuId,
      body.quantity,
    );
    return ResponseUtil.success(item, "已添加到购物车");
  }

  @Get("")
  @ApiOperation({ summary: "获取购物车" })
  async getCart(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    const items = await this.cartService.findByUser(user.userId);
    return ResponseUtil.success(items);
  }

  @Post("/update")
  @ApiOperation({ summary: "更新数量" })
  async updateCart(
    ctx: Context,
    @Body() body: { itemId: number; quantity: number },
  ) {
    const user = ctx.state.user as IUserContext;
    const item = await this.cartService.updateQuantity(
      user.userId,
      body.itemId,
      body.quantity,
    );
    return ResponseUtil.success(item, "已更新");
  }

  @Del("/:id")
  @ApiOperation({ summary: "删除购物车项" })
  async removeItem(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    await this.cartService.removeItem(user.userId, parseInt(id, 10));
    return ResponseUtil.success(null, "已删除");
  }

  @Del("")
  @ApiOperation({ summary: "清空购物车" })
  async clearCart(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    await this.cartService.clear(user.userId);
    return ResponseUtil.success(null, "已清空");
  }
}
