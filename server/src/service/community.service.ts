import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, PostStatus } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class CommunityService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 游记列表 */
  async findPosts(params: {
    userId?: number;
    status?: PostStatus;
    keyword?: string;
    topicId?: number;
    page?: number;
    pageSize?: number;
  }) {
    const {
      userId,
      status,
      keyword,
      topicId,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    else where.status = "NORMAL"; // 默认只显示正常状态
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }
    if (topicId) where.topicIds = { contains: String(topicId) };

    const [list, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 游记详情 */
  async findPostById(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    if (post) {
      // 增加浏览量
      await this.prisma.post.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return post;
  }

  /** 发布游记 */
  async createPost(data: {
    userId: number;
    title: string;
    content?: string;
    images?: string[];
    videoUrl?: string;
    locationId?: number;
    locationType?: string;
    locationName?: string;
    topicIds?: number[];
  }) {
    return this.prisma.post.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        images: data.images ? JSON.stringify(data.images) : null,
        videoUrl: data.videoUrl,
        locationId: data.locationId,
        locationType: data.locationType,
        locationName: data.locationName,
        topicIds: data.topicIds ? JSON.stringify(data.topicIds) : null,
        status: "UNDER_REVIEW",
      },
    });
  }

  /** 编辑游记 */
  async updatePost(id: number, userId: number, data: any) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new Error("游记不存在");
    if (post.userId !== userId) throw new Error("无权编辑该游记");

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        images: data.images ? JSON.stringify(data.images) : undefined,
        topicIds: data.topicIds ? JSON.stringify(data.topicIds) : undefined,
        status: "UNDER_REVIEW", // 编辑后重新审核
      },
    });
  }

  /** 删除游记 */
  async deletePost(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new Error("游记不存在");
    if (post.userId !== userId) throw new Error("无权删除该游记");

    return this.prisma.post.delete({ where: { id } });
  }

  /** 点赞/取消点赞（事务保证原子性） */
  async toggleLike(
    userId: number,
    targetType: "POST" | "COMMENT",
    targetId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: { userId_targetType_targetId: { userId, targetType, targetId } },
      });

      if (existing) {
        await tx.like.delete({ where: { id: existing.id } });
        const model = targetType === "POST" ? tx.post : tx.comment;
        await (model as any).update({
          where: { id: targetId },
          data: { likeCount: { decrement: 1 } },
        });
        return { isLiked: false };
      } else {
        await tx.like.create({ data: { userId, targetType, targetId } });
        const model = targetType === "POST" ? tx.post : tx.comment;
        await (model as any).update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
        });
        return { isLiked: true };
      }
    });
  }

  /** 评论列表 */
  async findComments(postId: number, page: number, pageSize: number) {
    const [list, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, status: "NORMAL", parentId: null },
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          children: {
            where: { status: "NORMAL" },
            include: {
              user: { select: { id: true, nickname: true, avatar: true } },
            },
            take: 5,
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({
        where: { postId, status: "NORMAL", parentId: null },
      }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 发表评论 */
  async createComment(data: {
    postId: number;
    userId: number;
    content: string;
    parentId?: number;
    replyToUserId?: number;
  }) {
    const post = await this.prisma.post.findUnique({
      where: { id: data.postId },
    });
    if (!post) throw new Error("游记不存在");

    const comment = await this.prisma.comment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
        parentId: data.parentId,
        replyToUserId: data.replyToUserId,
        status: "NORMAL",
      },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });

    // 更新评论数
    await this.prisma.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  /** 话题列表 */
  async findTopics(page: number, pageSize: number) {
    const [list, total] = await Promise.all([
      this.prisma.topic.findMany({
        where: { status: true },
        orderBy: [{ isTop: "desc" }, { postCount: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.topic.count({ where: { status: true } }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 关注/取消关注（事务保证原子性） */
  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) throw new Error("不能关注自己");

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });

      if (existing) {
        await tx.follow.delete({ where: { id: existing.id } });
        return { isFollowed: false };
      } else {
        await tx.follow.create({ data: { followerId, followingId } });
        return { isFollowed: true };
      }
    });
  }
}
