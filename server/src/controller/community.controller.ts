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
import { CommunityService } from "../service/community.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import { CreatePostDTO, CreateCommentDTO } from "../dto/community.dto";
import { PAGINATION } from "../common/constants";

@ApiTags("community")
@Controller("/api")
export class CommunityController {
  @Inject()
  communityService!: CommunityService;

  @Public()
  @Get("/posts")
  @ApiOperation({ summary: "游记列表" })
  async getPosts(
    @Query("keyword") keyword?: string,
    @Query("topicId") topicId?: string,
    @Query("userId") userId?: string,
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

    const result = await this.communityService.findPosts({
      keyword,
      topicId: topicId ? parseInt(topicId, 10) : undefined,
      userId: userId ? parseInt(userId, 10) : undefined,
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
  @Get("/posts/:id")
  @ApiOperation({ summary: "游记详情" })
  async getPostDetail(@Param("id") id: string) {
    const post = await this.communityService.findPostById(parseInt(id, 10));
    if (!post) return ResponseUtil.error("游记不存在", 404);
    return ResponseUtil.success(post);
  }

  @Post("/posts")
  @ApiOperation({ summary: "发布游记" })
  async createPost(ctx: Context, @Body() body: CreatePostDTO) {
    const user = ctx.state.user as IUserContext;
    const post = await this.communityService.createPost({
      userId: user.userId,
      ...body,
    });
    return ResponseUtil.success(post, "发布成功，等待审核");
  }

  @Put("/posts/:id")
  @ApiOperation({ summary: "编辑游记" })
  async updatePost(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: CreatePostDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const post = await this.communityService.updatePost(
      parseInt(id, 10),
      user.userId,
      body,
    );
    return ResponseUtil.success(post, "更新成功");
  }

  @Del("/posts/:id")
  @ApiOperation({ summary: "删除游记" })
  async deletePost(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    await this.communityService.deletePost(parseInt(id, 10), user.userId);
    return ResponseUtil.success(null, "已删除");
  }

  @Post("/posts/:id/like")
  @ApiOperation({ summary: "点赞/取消点赞" })
  async togglePostLike(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const result = await this.communityService.toggleLike(
      user.userId,
      "POST",
      parseInt(id, 10),
    );
    return ResponseUtil.success(result);
  }

  @Public()
  @Get("/posts/:id/comments")
  @ApiOperation({ summary: "评论列表" })
  async getComments(
    @Param("id") id: string,
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

    const result = await this.communityService.findComments(
      parseInt(id, 10),
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

  @Post("/posts/:id/comments")
  @ApiOperation({ summary: "发表评论" })
  async createComment(
    ctx: Context,
    @Param("id") id: string,
    @Body() body: CreateCommentDTO,
  ) {
    const user = ctx.state.user as IUserContext;
    const comment = await this.communityService.createComment({
      postId: parseInt(id, 10),
      userId: user.userId,
      content: body.content,
      parentId: body.parentId,
      replyToUserId: body.replyToUserId,
    });
    return ResponseUtil.success(comment, "评论成功");
  }

  @Post("/comments/:id/like")
  @ApiOperation({ summary: "评论点赞" })
  async toggleCommentLike(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const result = await this.communityService.toggleLike(
      user.userId,
      "COMMENT",
      parseInt(id, 10),
    );
    return ResponseUtil.success(result);
  }

  @Public()
  @Get("/topics")
  @ApiOperation({ summary: "话题列表" })
  async getTopics(
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

    const result = await this.communityService.findTopics(
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

  @Post("/users/:id/follow")
  @ApiOperation({ summary: "关注/取消关注" })
  async toggleFollow(ctx: Context, @Param("id") id: string) {
    const user = ctx.state.user as IUserContext;
    const result = await this.communityService.toggleFollow(
      user.userId,
      parseInt(id, 10),
    );
    return ResponseUtil.success(result);
  }
}
