package com.wudong.service;

import com.wudong.entity.*;
import com.wudong.common.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * 管理后台服务 - 等价于 Node.js 版本的 AdminService
 */
public interface AdminService {

    /**
     * 管理员登录
     */
    Map<String, Object> login(String username, String password);

    /**
     * 仪表盘统计
     */
    Map<String, Object> getDashboard();

    /**
     * 获取用户列表
     */
    Page<User> getUsers(String keyword, Pageable pageable);

    /**
     * 修改用户状态
     */
    void updateUserStatus(Long userId, UserStatus status);

    /**
     * 获取商家列表
     */
    Page<Merchant> getMerchants(MerchantStatus status, Pageable pageable);

    /**
     * 审核商家
     */
    void reviewMerchant(Long merchantId, boolean approved, String rejectReason);

    /**
     * 获取订单列表
     */
    Page<Order> getOrders(OrderStatus status, OrderType orderType, Pageable pageable);

    /**
     * 获取财务记录
     */
    Page<FinanceRecord> getFinanceRecords(Long merchantId, FinanceStatus status, Pageable pageable);

    /**
     * 结算财务记录
     */
    void settleFinance(Long recordId);

    /**
     * 获取举报列表
     */
    Page<Report> getReports(ReportStatus status, Pageable pageable);

    /**
     * 处理举报
     */
    void handleReport(Long reportId, Long handlerId, String handleResult, boolean approved);

    /**
     * 获取公告列表
     */
    List<Announcement> getAnnouncements();

    /**
     * 创建公告
     */
    Announcement createAnnouncement(String title, String content);

    /**
     * 获取轮播图列表
     */
    List<Banner> getBanners();

    /**
     * 创建轮播图
     */
    Banner createBanner(String title, String imageUrl, String linkUrl, String module, Integer sort);

    /**
     * 获取系统配置列表
     */
    List<SystemConfig> getConfigs();

    /**
     * 更新系统配置
     */
    void updateConfig(String key, String value, String remark);

    /**
     * 获取商家申请列表
     */
    Page<MerchantApplication> getMerchantApplications(MerchantStatus status, Pageable pageable);

    /**
     * 审核商家申请
     */
    void reviewMerchantApplication(Long applicationId, boolean approved, String rejectReason, Long reviewerId);

    /**
     * 获取操作日志
     */
    Page<OperationLog> getLogs(Pageable pageable);

    /**
     * 获取推荐列表
     */
    List<Recommendation> getRecommendations();

    /**
     * 创建推荐
     */
    Recommendation createRecommendation(String name, String targetType, Long targetId, String module, Integer sort);

    /**
     * 获取敏感词列表
     */
    List<SensitiveWord> getSensitiveWords();

    /**
     * 添加敏感词
     */
    SensitiveWord addSensitiveWord(String word, Integer level);
}
