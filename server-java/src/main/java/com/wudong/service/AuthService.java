package com.wudong.service;

/**
 * 认证服务 - 等价于 Node.js 版本的 AuthService
 * 短信验证码管理
 */
public interface AuthService {

    /**
     * 发送短信验证码（模拟实现）
     */
    void sendSms(String phone);

    /**
     * 验证短信验证码
     */
    boolean verifySms(String phone, String code);
}
