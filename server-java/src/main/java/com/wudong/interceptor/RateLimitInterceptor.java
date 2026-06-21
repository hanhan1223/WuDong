package com.wudong.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

/**
 * 限流拦截器 - 等价于 Node.js 版本的 RateLimitMiddleware
 * 基于 Redis 的滑动窗口限流
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIp(request);

        // 确定限流阈值
        int limit = getRateLimit(path, method);

        // Redis 滑动窗口键
        String key = BusinessConstants.CACHE_PREFIX_RATE_LIMIT + clientIp + ":" + path;
        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - BusinessConstants.RATE_LIMIT_WINDOW * 1000L;

        try {
            // 使用 Redis 的 Sorted Set 实现滑动窗口
            String member = String.valueOf(currentTime);

            // 移除窗口外的记录
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);

            // 获取当前窗口内的请求数
            Long count = redisTemplate.opsForZSet().zCard(key);

            if (count != null && count >= limit) {
                log.warn("Rate limit exceeded: ip={}, path={}, count={}", clientIp, path, count);

                // 设置限流头
                response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
                response.setHeader("X-RateLimit-Remaining", "0");
                response.setStatus(429);
                response.setContentType("application/json;charset=UTF-8");

                ApiResponse<?> errorResponse = ApiResponse.error("请求过于频繁，请稍后再试", 429);
                response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                return false;
            }

            // 添加当前请求
            redisTemplate.opsForZSet().add(key, member, currentTime);
            redisTemplate.expire(key, BusinessConstants.RATE_LIMIT_WINDOW, TimeUnit.SECONDS);

            // 设置限流头
            response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - (count == null ? 0 : count) - 1)));

        } catch (Exception e) {
            // Redis 不可用时降级放行
            log.warn("Rate limit check failed (degraded): {}", e.getMessage());
        }

        return true;
    }

    /**
     * 根据路径和方法确定限流阈值
     */
    private int getRateLimit(String path, String method) {
        if ("POST".equals(method)) {
            if (path.contains("/login")) {
                return BusinessConstants.RATE_LIMIT_LOGIN;
            }
            if (path.contains("/register")) {
                return BusinessConstants.RATE_LIMIT_REGISTER;
            }
        }
        return BusinessConstants.RATE_LIMIT_DEFAULT;
    }

    /**
     * 获取客户端真实 IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理时取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
