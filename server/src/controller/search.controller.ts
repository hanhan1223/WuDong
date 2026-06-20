import { Controller, Get, Query, Inject } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { SearchService } from "../service/search.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import { PAGINATION } from "../common/constants";

@ApiTags("search")
@Controller("/api/search")
export class SearchController {
  @Inject()
  searchService!: SearchService;

  @Public()
  @Get("")
  @ApiOperation({ summary: "搜索" })
  async search(
    @Query("q") keyword: string,
    @Query("type") type?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    if (!keyword || !keyword.trim()) {
      return ResponseUtil.error("请输入搜索关键词", 400);
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

    const results: any = {};

    if (!type || type === "products") {
      results.products = await this.searchService.searchProducts(
        keyword,
        parsedPage as any,
        parsedPageSize as any,
      );
    }
    if (!type || type === "posts") {
      results.posts = await this.searchService.searchPosts(
        keyword,
        parsedPage as any,
        parsedPageSize as any,
      );
    }

    return ResponseUtil.success(results);
  }

  @Get("/history")
  @ApiOperation({ summary: "搜索历史" })
  async getHistory(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    const history = await this.searchService.getHistory(user.userId);
    return ResponseUtil.success(history);
  }
}
