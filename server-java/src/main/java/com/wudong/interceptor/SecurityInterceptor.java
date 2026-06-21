package com.wudong.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

/**
 * 安全拦截器 - 等价于 Node.js 版本的 SecurityMiddleware
 * 设置安全头、CSRF 防护、XSS 防护
 */
@Slf4j
@Component
public class SecurityInterceptor implements HandlerInterceptor {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private static final List<String> XSS_FIELDS = List.of(
            "content", "title", "introduction", "detail", "bio", "notes",
            "replyContent", "appendContent"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 设置安全头
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // CSRF 防护 - 对于 POST/PUT/DELETE/PATCH 请求验证 Origin
        String method = request.getMethod();
        if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method) || "PATCH".equals(method)) {
            String origin = request.getHeader("Origin");
            String referer = request.getHeader("Referer");

            if (origin != null && !isAllowedOrigin(origin)) {
                log.warn("CSRF check failed: origin={} not allowed", origin);
                response.setStatus(403);
                return false;
            }

            if (origin == null && referer != null && !isAllowedReferer(referer)) {
                log.warn("CSRF check failed: referer={} not allowed", referer);
                response.setStatus(403);
                return false;
            }
        }

        return true;
    }

    private boolean isAllowedOrigin(String origin) {
        List<String> allowed = Arrays.asList(allowedOrigins.split(","));
        return allowed.stream().anyMatch(o -> o.trim().equals(origin));
    }

    private boolean isAllowedReferer(String referer) {
        List<String> allowed = Arrays.asList(allowedOrigins.split(","));
        return allowed.stream().anyMatch(o -> referer.startsWith(o.trim()));
    }

    /**
     * XSS 过滤 - 转义 HTML 特殊字符
     */
    public static String escapeXss(String value) {
        if (value == null) {
            return null;
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
