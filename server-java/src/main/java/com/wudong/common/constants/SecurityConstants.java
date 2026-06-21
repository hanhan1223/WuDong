package com.wudong.common.constants;

import java.util.List;

/**
 * 安全路径常量 - 统一管理公开路径白名单
 * SecurityConfig 和 JwtAuthenticationFilter 共用此常量，避免重复维护
 */
public final class SecurityConstants {

    private SecurityConstants() {
        throw new UnsupportedOperationException("常量类不允许实例化");
    }

    /** Swagger / OpenAPI 路径 */
    public static final List<String> SWAGGER_PATHS = List.of(
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**",
            "/webjars/**"
    );

    /** 完全公开的端点（任意方法，通常用于登录/注册） */
    public static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/health",
            "/api/users/register",
            "/api/users/login",
            "/api/users/send-sms",
            "/api/users/login-sms",
            "/api/admin/login"
    );

    /** 公开浏览的 GET 端点（未登录可查看列表/详情） */
    public static final List<String> PUBLIC_GET_ENDPOINTS = List.of(
            "/api/products",
            "/api/products/hot",
            "/api/products/categories",
            "/api/products/{id}",
            "/api/restaurants",
            "/api/restaurants/{id}",
            "/api/restaurants/{id}/dishes",
            "/api/restaurants/{id}/timeslots",
            "/api/farm/categories",
            "/api/farm/products",
            "/api/farm/products/{id}",
            "/api/homestays",
            "/api/homestays/{id}",
            "/api/homestays/{id}/rooms",
            "/api/homestays/rooms/{roomId}/calendar",
            "/api/scenic-spots",
            "/api/scenic-spots/{id}",
            "/api/scenic-spots/{id}/tickets",
            "/api/routes",
            "/api/routes/{id}",
            "/api/transport-guides",
            "/api/e-tickets/{code}",
            "/api/posts",
            "/api/posts/{id}",
            "/api/posts/{id}/comments",
            "/api/topics",
            "/api/search"
    );
}
