package com.wudong.common.response;

import java.util.List;

public final class ResponseUtil {

    private ResponseUtil() {
        throw new UnsupportedOperationException("工具类不允许实例化");
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.success(data, message);
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.error(message);
    }

    public static <T> ApiResponse<T> error(String message, int code) {
        return ApiResponse.error(message, code);
    }

    public static <T> ApiResponse<PageResult<T>> paginate(List<T> list, long total, int page, int pageSize) {
        PageResult<T> pageResult = PageResult.of(list, total, page, pageSize);
        return ApiResponse.success(pageResult);
    }
}
