package com.wudong.controller;

import com.wudong.common.enums.*;
import com.wudong.common.response.ApiResponse;
import com.wudong.dto.admin.*;
import com.wudong.entity.*;
import com.wudong.security.SecurityUtils;
import com.wudong.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "管理后台")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "管理员登录")
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody AdminLoginRequest request) {
        Map<String, Object> result = adminService.login(request.getUsername(), request.getPassword());
        return ApiResponse.success(result, "登录成功");
    }

    @Operation(summary = "仪表盘统计")
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> getDashboard() {
        return ApiResponse.success(adminService.getDashboard());
    }

    @Operation(summary = "获取用户列表")
    @GetMapping("/users")
    public ApiResponse<Page<User>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getUsers(keyword, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "修改用户状态")
    @PostMapping("/users/{id}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        adminService.updateUserStatus(id, status);
        return ApiResponse.success(null, "状态已更新");
    }

    @Operation(summary = "获取商家列表")
    @GetMapping("/merchants")
    public ApiResponse<Page<Merchant>> getMerchants(
            @RequestParam(required = false) MerchantStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getMerchants(status, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "审核商家")
    @PostMapping("/merchants/{id}/review")
    public ApiResponse<Void> reviewMerchant(@PathVariable Long id, @Valid @RequestBody ReviewMerchantRequest request) {
        adminService.reviewMerchant(id, request.getApproved(), request.getRejectReason());
        return ApiResponse.success(null, "审核完成");
    }

    @Operation(summary = "获取订单列表")
    @GetMapping("/orders")
    public ApiResponse<Page<Order>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderType orderType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getOrders(status, orderType, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取财务记录")
    @GetMapping("/finance/records")
    public ApiResponse<Page<FinanceRecord>> getFinanceRecords(
            @RequestParam(required = false) Long merchantId,
            @RequestParam(required = false) FinanceStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getFinanceRecords(merchantId, status, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "结算财务记录")
    @PostMapping("/finance/{id}/settle")
    public ApiResponse<Void> settleFinance(@PathVariable Long id) {
        adminService.settleFinance(id);
        return ApiResponse.success(null, "结算成功");
    }

    @Operation(summary = "获取退款列表")
    @GetMapping("/refunds")
    public ApiResponse<Page<Refund>> getRefunds(
            @RequestParam(required = false) RefundStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getRefunds(status, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "审批退款")
    @PostMapping("/refunds/{id}/approve")
    public ApiResponse<Void> approveRefund(@PathVariable Long id) {
        adminService.approveRefund(id);
        return ApiResponse.success(null, "退款已批准");
    }

    @Operation(summary = "获取举报列表")
    @GetMapping("/reports")
    public ApiResponse<Page<Report>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getReports(status, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "处理举报")
    @PostMapping("/reports/{id}/handle")
    public ApiResponse<Void> handleReport(@PathVariable Long id, @Valid @RequestBody HandleReportRequest request) {
        Long handlerId = SecurityUtils.getCurrentAdminId();
        adminService.handleReport(id, handlerId, request.getHandleResult(), request.getApproved());
        return ApiResponse.success(null, "处理完成");
    }

    @Operation(summary = "获取公告列表")
    @GetMapping("/announcements")
    public ApiResponse<List<Announcement>> getAnnouncements() {
        return ApiResponse.success(adminService.getAnnouncements());
    }

    @Operation(summary = "创建公告")
    @PostMapping("/announcements")
    public ApiResponse<Announcement> createAnnouncement(@Valid @RequestBody CreateAnnouncementRequest request) {
        return ApiResponse.success(adminService.createAnnouncement(request.getTitle(), request.getContent()));
    }

    @Operation(summary = "获取轮播图列表")
    @GetMapping("/banners")
    public ApiResponse<List<Banner>> getBanners() {
        return ApiResponse.success(adminService.getBanners());
    }

    @Operation(summary = "创建轮播图")
    @PostMapping("/banners")
    public ApiResponse<Banner> createBanner(@Valid @RequestBody CreateBannerRequest request) {
        return ApiResponse.success(adminService.createBanner(request.getTitle(), request.getImageUrl(),
                request.getLinkUrl(), request.getModule(), request.getSort()));
    }

    @Operation(summary = "获取系统配置")
    @GetMapping("/configs")
    public ApiResponse<List<SystemConfig>> getConfigs() {
        return ApiResponse.success(adminService.getConfigs());
    }

    @Operation(summary = "更新系统配置")
    @PutMapping("/configs")
    public ApiResponse<Void> updateConfig(@Valid @RequestBody UpdateConfigRequest request) {
        adminService.updateConfig(request.getKey(), request.getValue(), request.getRemark());
        return ApiResponse.success(null, "配置已更新");
    }

    @Operation(summary = "获取商家申请列表")
    @GetMapping("/merchant-applications")
    public ApiResponse<Page<MerchantApplication>> getMerchantApplications(
            @RequestParam(required = false) MerchantStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getMerchantApplications(status, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "审核商家申请")
    @PostMapping("/merchant-applications/{id}/review")
    public ApiResponse<Void> reviewMerchantApplication(@PathVariable Long id, @Valid @RequestBody ReviewMerchantRequest request) {
        Long reviewerId = SecurityUtils.getCurrentAdminId();
        adminService.reviewMerchantApplication(id, request.getApproved(), request.getRejectReason(), reviewerId);
        return ApiResponse.success(null, "审核完成");
    }

    @Operation(summary = "获取操作日志")
    @GetMapping("/logs")
    public ApiResponse<Page<OperationLog>> getLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(adminService.getLogs(PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取推荐列表")
    @GetMapping("/recommendations")
    public ApiResponse<List<Recommendation>> getRecommendations() {
        return ApiResponse.success(adminService.getRecommendations());
    }

    @Operation(summary = "创建推荐")
    @PostMapping("/recommendations")
    public ApiResponse<Recommendation> createRecommendation(@Valid @RequestBody CreateRecommendationRequest request) {
        return ApiResponse.success(adminService.createRecommendation(
                request.getName(), request.getTargetType(), request.getTargetId(),
                request.getModule(), request.getSort()));
    }

    @Operation(summary = "获取敏感词列表")
    @GetMapping("/sensitive-words")
    public ApiResponse<List<SensitiveWord>> getSensitiveWords() {
        return ApiResponse.success(adminService.getSensitiveWords());
    }

    @Operation(summary = "添加敏感词")
    @PostMapping("/sensitive-words")
    public ApiResponse<SensitiveWord> addSensitiveWord(@Valid @RequestBody AddSensitiveWordRequest request) {
        return ApiResponse.success(adminService.addSensitiveWord(request.getWord(), request.getLevel()));
    }
}
