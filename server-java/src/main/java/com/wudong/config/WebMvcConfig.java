package com.wudong.config;

import com.wudong.interceptor.RateLimitInterceptor;
import com.wudong.interceptor.ReportInterceptor;
import com.wudong.interceptor.SecurityInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final SecurityInterceptor securityInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;
    private final ReportInterceptor reportInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 等价于 Node.js 版本的中间件注册顺序: Security -> RateLimit -> Report
        registry.addInterceptor(securityInterceptor)
                .addPathPatterns("/api/**")
                .order(1);

        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**")
                .order(2);

        registry.addInterceptor(reportInterceptor)
                .addPathPatterns("/api/**")
                .order(3);
    }
}
