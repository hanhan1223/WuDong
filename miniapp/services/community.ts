import { get, post } from "./request";

/** 获取游记列表 */
export const getPosts = (params: {
  sort?: "recommend" | "latest";
  topicId?: number;
  page?: number;
  pageSize?: number;
}) => get<{ list: any[]; total: number }>("/community/posts", params);

/** 获取游记详情 */
export const getPostDetail = (id: number) => get<any>(`/community/posts/${id}`);

/** 发布游记 */
export const publishPost = (data: {
  title: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  topicIds?: number[];
  locationId?: number;
  locationType?: string;
  locationName?: string;
}) => post<any>("/community/posts", data);

/** 点赞/取消点赞 */
export const toggleLike = (targetType: string, targetId: number) =>
  post("/community/like/toggle", { targetType, targetId });

/** 发表评论 */
export const addComment = (data: {
  postId: number;
  content: string;
  parentId?: number;
  replyToUserId?: number;
}) => post<any>("/community/comments", data);

/** 获取评论列表 */
export const getComments = (postId: number, page?: number) =>
  get<{ list: any[]; total: number }>(`/community/posts/${postId}/comments`, {
    page,
  });

/** 关注/取消关注 */
export const toggleFollow = (userId: number) =>
  post("/community/follow/toggle", { userId });

/** 搜索游记 */
export const searchPosts = (keyword: string, page?: number) =>
  get<{ list: any[]; total: number }>("/community/search", { keyword, page });
