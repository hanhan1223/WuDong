import {
  Controller,
  Post,
  Put,
  Del,
  Get,
  Body,
  Query,
  Inject,
  Param,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { PrismaClient } from "@prisma/client";
import { ProductService } from "../service/product.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { PAGINATION } from "../common/constants";

@ApiTags("product")
@Controller("/api/products")
export class ProductController {
  @Inject()
  productService!: ProductService;

  @Inject("prisma")
  prisma!: PrismaClient;

  @Public()
  @Get("")
  @ApiOperation({ summary: "商品列表" })
  async getList(
    @Query("categoryId") categoryId?: string,
    @Query("keyword") keyword?: string,
    @Query("status") status?: string,
    @Query("orderBy") orderBy?: string,
    @Query("order") order?: string,
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

    const result = await this.productService.findMany({
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      keyword,
      orderBy: orderBy as any,
      order: order as any,
      status:
        status === "ALL"
          ? undefined
          : status && status.trim()
            ? (status as any)
            : "ACTIVE",
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
  @Get("/hot")
  @ApiOperation({ summary: "热门商品" })
  async getHot(@Query("limit") limit?: string) {
    const products = await this.productService.findHot(
      limit ? parseInt(limit, 10) : 10,
    );
    return ResponseUtil.success(products);
  }

  @Public()
  @Get("/categories")
  @ApiOperation({ summary: "商品分类" })
  async getCategories() {
    const categories = await this.productService.getCategories();
    return ResponseUtil.success(categories);
  }

  @Public()
  @Get("/:id")
  @ApiOperation({ summary: "商品详情" })
  async getDetail(@Param("id") id: string) {
    const product = await this.productService.findById(parseInt(id, 10));
    if (!product) return ResponseUtil.error("商品不存在", 404);
    return ResponseUtil.success(product);
  }

  @Post("")
  @ApiOperation({ summary: "创建商品" })
  async create(ctx: Context, @Body() body: CreateProductDTO) {
    const user = ctx.state.user as IUserContext;
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId: user.userId },
    });
    if (!merchant) return ResponseUtil.error("商家信息不存在", 400);
    const product = await this.productService.create({
      ...body,
      merchantId: merchant.id,
    });
    return ResponseUtil.success(product, "商品创建成功");
  }

  @Put("/:id")
  @ApiOperation({ summary: "更新商品" })
  async update(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: UpdateProductDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId: user.userId },
    });
    if (!merchant) return ResponseUtil.error("商家信息不存在", 400);
    const product = await this.productService.update(
      parseInt(id, 10),
      merchant.id,
      body,
    );
    return ResponseUtil.success(product, "商品更新成功");
  }

  @Del("/:id")
  @ApiOperation({ summary: "删除商品" })
  async delete(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId: user.userId },
    });
    if (!merchant) return ResponseUtil.error("商家信息不存在", 400);
    await this.productService.delete(parseInt(id, 10), merchant.id);
    return ResponseUtil.success(null, "商品已删除");
  }
}
