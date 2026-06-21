package com.wudong.interceptor;

import com.wudong.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 日志拦截器 - 等价于 Node.js 版本的 ReportMiddleware
 * 记录请求/响应日志，慢请求警告
 */
@Slf4j
@Component
public class ReportInterceptor implements HandlerInterceptor {

    private static final long SLOW_REQUEST_THRESHOLD = 500; // 500ms

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);

        // 记录请求日志
        String method = request.getMethod();
        String path = request.getRequestURI();
        String query = request.getQueryString();
        String ip = request.getRemoteAddr();
        Long userId = SecurityUtils.getCurrentUserIdOrNull();

        log.info("[Request] {} {} {} ip={} userId={}",
                method, path,
                query != null ? "?" + query : "",
                ip,
                userId != null ? userId : "anonymous");

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        long startTime = (long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;

        String method = request.getMethod();
        String path = request.getRequestURI();
        int status = response.getStatus();

        // 记录响应日志
        log.info("[Response] {} {} status={} duration={}ms", method, path, status, duration);

        // 慢请求警告
        if (duration > SLOW_REQUEST_THRESHOLD) {
            log.warn("[SlowRequest] {} {} took {}ms (threshold: {}ms)", method, path, duration, SLOW_REQUEST_THRESHOLD);
        }

        // 错误日志
        if (ex != null) {
            log.error("[Error] {} {} exception: {}", method, path, ex.getMessage(), ex);
        }
    }
}
