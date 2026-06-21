package com.wudong.security;

import com.wudong.common.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 安全工具类 - 获取当前登录用户信息
 */
public final class SecurityUtils {

    private SecurityUtils() {
        throw new UnsupportedOperationException("工具类不允许实例化");
    }

    /**
     * 获取当前认证信息
     */
    public static UserAuthentication getCurrentAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof UserAuthentication) {
            return (UserAuthentication) authentication;
        }
        return null;
    }

    /**
     * 获取当前用户ID
     */
    public static Long getCurrentUserId() {
        UserAuthentication auth = getCurrentAuthentication();
        if (auth == null) {
            throw new BusinessException("未登录", 401);
        }
        return auth.getUserId();
    }

    /**
     * 获取当前用户ID（可能为null）
     */
    public static Long getCurrentUserIdOrNull() {
        UserAuthentication auth = getCurrentAuthentication();
        return auth != null ? auth.getUserId() : null;
    }

    /**
     * 获取当前用户角色
     */
    public static String getCurrentRole() {
        UserAuthentication auth = getCurrentAuthentication();
        if (auth == null) {
            return null;
        }
        return auth.getRole();
    }

    /**
     * 获取当前用户手机号
     */
    public static String getCurrentPhone() {
        UserAuthentication auth = getCurrentAuthentication();
        if (auth == null) {
            return null;
        }
        return auth.getPhone();
    }

    /**
     * 获取当前管理员ID
     */
    public static Long getCurrentAdminId() {
        UserAuthentication auth = getCurrentAuthentication();
        if (auth == null || auth.getAdminId() == null) {
            throw new BusinessException("未登录管理后台", 401);
        }
        return auth.getAdminId();
    }

    /**
     * 是否已认证
     */
    public static boolean isAuthenticated() {
        return getCurrentAuthentication() != null;
    }

    /**
     * 是否是管理员
     */
    public static boolean isAdmin() {
        String role = getCurrentRole();
        return "ADMIN".equals(role);
    }

    /**
     * 是否是商家
     */
    public static boolean isMerchant() {
        String role = getCurrentRole();
        return "MERCHANT".equals(role);
    }
}
