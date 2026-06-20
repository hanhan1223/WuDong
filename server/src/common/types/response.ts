import { ApiResponse, PaginationResult } from "../../interface";

/**
 * 统一响应工具
 */
export class ResponseUtil {
  static success<T>(data: T, message = "操作成功"): ApiResponse<T> {
    return { code: 200, message, data };
  }

  static error(message = "操作失败", code = 500): ApiResponse<null> {
    return { code, message, data: null };
  }

  static paginate<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
  ): ApiResponse<PaginationResult<T>> {
    return {
      code: 200,
      message: "操作成功",
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
