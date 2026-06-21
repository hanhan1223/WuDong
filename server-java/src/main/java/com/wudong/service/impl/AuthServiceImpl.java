package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.exception.BusinessException;
import com.wudong.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * 认证服务实现 - 等价于 Node.js 版本的 AuthService
 * 短信验证码管理
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final StringRedisTemplate redisTemplate;
    private final Random random = new Random();

    /**
     * 发送短信验证码（模拟实现）
     */
    @Override
    public void sendSms(String phone) {
        // 生成6位验证码
        String code = String.format("%06d", random.nextInt(1000000));

        // 存储到 Redis，5分钟过期
        String key = BusinessConstants.CACHE_PREFIX_SMS + phone;
        redisTemplate.opsForValue().set(key, code, BusinessConstants.CACHE_TTL_SMS, TimeUnit.SECONDS);

        // 模拟发送短信（实际应调用短信服务 API）
        log.info("[SMS] 向 {} 发送验证码", phone);
    }

    /**
     * 验证短信验证码
     */
    @Override
    public boolean verifySms(String phone, String code) {
        String key = BusinessConstants.CACHE_PREFIX_SMS + phone;
        String cachedCode = redisTemplate.opsForValue().get(key);

        if (cachedCode == null) {
            throw new BusinessException("验证码已过期", 400);
        }

        if (!cachedCode.equals(code)) {
            throw new BusinessException("验证码错误", 400);
        }

        // 验证成功后删除验证码
        redisTemplate.delete(key);
        return true;
    }
}
