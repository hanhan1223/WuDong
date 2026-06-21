package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.user.*;
import com.wudong.entity.User;
import com.wudong.security.SecurityUtils;
import com.wudong.service.AuthService;
import com.wudong.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "用户")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request.getPhone(), request.getPassword(), request.getNickname());
        Map<String, Object> result = userService.loginByPassword(request.getPhone(), request.getPassword());
        return ApiResponse.success(result, "注册成功");
    }

    @Operation(summary = "密码登录")
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = userService.loginByPassword(request.getPhone(), request.getPassword());
        return ApiResponse.success(result, "登录成功");
    }

    @Operation(summary = "发送短信验证码")
    @PostMapping("/send-sms")
    public ApiResponse<Void> sendSms(@Valid @RequestBody SendSmsRequest request) {
        authService.sendSms(request.getPhone());
        return ApiResponse.success(null, "验证码已发送");
    }

    @Operation(summary = "短信验证码登录")
    @PostMapping("/login-sms")
    public ApiResponse<Map<String, Object>> loginBySms(@Valid @RequestBody LoginSmsRequest request) {
        authService.verifySms(request.getPhone(), request.getCode());
        Map<String, Object> result = userService.loginBySms(request.getPhone());
        return ApiResponse.success(result, "登录成功");
    }

    @Operation(summary = "获取用户信息")
    @GetMapping("/profile")
    public ApiResponse<User> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.getUserById(userId);
        return ApiResponse.success(user);
    }

    @Operation(summary = "更新用户信息")
    @PutMapping("/profile")
    public ApiResponse<User> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.updateProfile(userId, request.getNickname(), request.getAvatar(),
                request.getGender(), request.getRegion(), request.getBio());
        return ApiResponse.success(user, "更新成功");
    }

    @Operation(summary = "修改密码")
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        return ApiResponse.success(null, "密码修改成功");
    }
}
