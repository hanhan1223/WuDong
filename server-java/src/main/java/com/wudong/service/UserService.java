package com.wudong.service;

import com.wudong.common.enums.UserStatus;
import com.wudong.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * 用户服务 - 等价于 Node.js 版本的 UserService
 */
public interface UserService {

    /**
     * 用户注册
     */
    User register(String phone, String password, String nickname);

    /**
     * 密码登录
     */
    Map<String, Object> loginByPassword(String phone, String password);

    /**
     * 短信验证码登录/注册
     */
    Map<String, Object> loginBySms(String phone);

    /**
     * 获取用户信息
     */
    User getUserById(Long userId);

    /**
     * 更新用户信息
     */
    User updateProfile(Long userId, String nickname, String avatar, Integer gender, String region, String bio);

    /**
     * 修改密码
     */
    void changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 管理员获取用户列表
     */
    Page<User> getUsers(String keyword, Pageable pageable);

    /**
     * 管理员修改用户状态
     */
    void updateUserStatus(Long userId, UserStatus status);
}
