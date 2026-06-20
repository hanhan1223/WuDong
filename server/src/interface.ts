/**
 * 乌东文旅 - 公共类型定义
 */

/** 统一 API 响应格式 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/** 分页请求参数 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

/** 分页响应数据 */
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** JWT Token 负载 */
export interface JwtPayload {
  userId: number;
  role: "TOURIST" | "MERCHANT" | "ADMIN";
  phone: string;
}

/** 当前登录用户上下文 */
export interface IUserContext {
  userId: number;
  role: "TOURIST" | "MERCHANT" | "ADMIN";
  phone: string;
}
