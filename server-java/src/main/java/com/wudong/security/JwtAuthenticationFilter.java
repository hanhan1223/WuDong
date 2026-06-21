package com.wudong.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wudong.common.constants.SecurityConstants;
import com.wudong.common.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * JWT 认证过滤器 - 等价于 Node.js 版本的 JwtGuard
 * 实现路径白名单逻辑和 JWT 令牌验证
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * 完全公开的路径（任意方法）
     */
    private static final List<String> PUBLIC_PATHS = SecurityConstants.PUBLIC_ENDPOINTS;

    /**
     * 仅 GET 公开的路径（浏览端点）
     */
    private static final List<String> PUBLIC_GET_PATHS = SecurityConstants.PUBLIC_GET_ENDPOINTS;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 检查是否是公开路径
        if (isPublicPath(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 提取并验证 JWT 令牌
        String token = extractToken(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            try {
                Long userId = jwtTokenProvider.getUserId(token);
                String role = jwtTokenProvider.getRole(token);
                String phone = jwtTokenProvider.getPhone(token);

                UserAuthentication authentication = new UserAuthentication(userId, role, phone);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                log.debug("User JWT processing failed, trying admin: {}", e.getMessage());
                try {
                    Long adminId = jwtTokenProvider.getAdminId(token);
                    String username = jwtTokenProvider.getClaims(token).get("username", String.class);
                    UserAuthentication authentication = new UserAuthentication(adminId, username);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception ex) {
                    log.warn("JWT token processing failed: {}", ex.getMessage());
                }
            }
        }

        // 如果没有有效认证，返回 401
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            ApiResponse<?> errorResponse = ApiResponse.error("未登录或登录已过期", 401);
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 检查路径是否是公开路径（区分 HTTP 方法）
     */
    private boolean isPublicPath(String path, String method) {
        // Swagger 路径
        for (String pattern : SecurityConstants.SWAGGER_PATHS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }

        // 完全公开的路径
        for (String pattern : PUBLIC_PATHS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }

        // 仅 GET 公开的路径
        if (HttpMethod.GET.name().equals(method)) {
            for (String pattern : PUBLIC_GET_PATHS) {
                if (pathMatcher.match(pattern, path)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 从请求头中提取 Bearer 令牌
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
