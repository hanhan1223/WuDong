package com.wudong.service.impl;

import com.wudong.common.enums.UserRole;
import com.wudong.common.enums.UserStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.User;
import com.wudong.repository.UserRepository;
import com.wudong.security.JwtTokenProvider;
import com.wudong.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户服务实现
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 用户注册
     */
    @Transactional
    public User register(String phone, String password, String nickname) {
        if (userRepository.existsByPhone(phone)) {
            throw new BusinessException("该手机号已注册");
        }

        User user = new User();
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));
        user.setNickname(nickname != null ? nickname : "用户" + phone.substring(7));
        user.setRole(UserRole.TOURIST);
        user.setStatus(UserStatus.ACTIVE);

        return userRepository.save(user);
    }

    /**
     * 密码登录
     */
    public Map<String, Object> loginByPassword(String phone, String password) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException("用户不存在", 404));

        // 短信注册的用户没有密码，不允许密码登录
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new BusinessException("该账号未设置密码，请使用短信验证码登录", 400);
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("密码错误", 401);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("账号已被禁用", 403);
        }

        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成令牌
        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name(), user.getPhone());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);
        return result;
    }

    /**
     * 短信验证码登录/注册
     */
    @Transactional
    public Map<String, Object> loginBySms(String phone) {
        User user = userRepository.findByPhone(phone).orElse(null);

        if (user == null) {
            // 自动注册（空密码，仅允许短信登录）
            user = new User();
            user.setPhone(phone);
            user.setPassword(""); // 空密码，不允许密码登录
            user.setNickname("用户" + phone.substring(7));
            user.setRole(UserRole.TOURIST);
            user.setStatus(UserStatus.ACTIVE);
            user = userRepository.save(user);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("账号已被禁用", 403);
        }

        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成令牌
        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name(), user.getPhone());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);
        return result;
    }

    /**
     * 获取用户信息
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在", 404));
    }

    /**
     * 更新用户信息
     */
    @Transactional
    public User updateProfile(Long userId, String nickname, String avatar, Integer gender, String region, String bio) {
        User user = getUserById(userId);

        if (nickname != null) user.setNickname(nickname);
        if (avatar != null) user.setAvatar(avatar);
        if (gender != null) {
            user.setGender(switch (gender) {
                case 1 -> com.wudong.common.enums.Gender.MALE;
                case 2 -> com.wudong.common.enums.Gender.FEMALE;
                default -> com.wudong.common.enums.Gender.UNKNOWN;
            });
        }
        if (region != null) user.setRegion(region);
        if (bio != null) user.setBio(bio);

        return userRepository.save(user);
    }

    /**
     * 修改密码
     */
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * 管理员获取用户列表
     */
    @Transactional(readOnly = true)
    public Page<User> getUsers(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return userRepository.findByNicknameContainingOrPhoneContaining(keyword, keyword, pageable);
        }
        return userRepository.findAll(pageable);
    }

    /**
     * 管理员修改用户状态
     */
    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = getUserById(userId);
        user.setStatus(status);
        userRepository.save(user);
    }
}
