package com.wudong.service.impl;

import com.wudong.common.enums.*;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.security.JwtTokenProvider;
import com.wudong.service.AdminService;
import com.wudong.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理后台服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminUserRepository adminUserRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final OrderRepository orderRepository;
    private final FinanceRecordRepository financeRecordRepository;
    private final ReportRepository reportRepository;
    private final AnnouncementRepository announcementRepository;
    private final BannerRepository bannerRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final RecommendationRepository recommendationRepository;
    private final SensitiveWordRepository sensitiveWordRepository;
    private final OperationLogRepository operationLogRepository;
    private final MerchantApplicationRepository merchantApplicationRepository;
    private final PostRepository postRepository;
    private final RefundRepository refundRepository;
    private final PaymentService paymentService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Map<String, Object> login(String username, String password) {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("管理员不存在", 404));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new BusinessException("密码错误", 401);
        }

        if (admin.getStatus() == AdminStatus.DISABLED) {
            throw new BusinessException("账号已被禁用", 403);
        }

        admin.setLastLoginAt(LocalDateTime.now());
        adminUserRepository.save(admin);

        String token = jwtTokenProvider.generateAdminToken(admin.getId(), admin.getUsername());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("admin", admin);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("todayOrders", orderRepository.countByCreatedAtAfter(LocalDate.now().atStartOfDay()));
        stats.put("todayGMV", orderRepository.sumPayAmountAfter(LocalDate.now().atStartOfDay()));
        stats.put("activeMerchants", merchantRepository.countByStatus(MerchantStatus.APPROVED));
        stats.put("pendingReviews", postRepository.countByStatus(PostStatus.UNDER_REVIEW));
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> getUsers(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return userRepository.findByNicknameContainingOrPhoneContaining(keyword, keyword, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在", 404));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Merchant> getMerchants(MerchantStatus status, Pageable pageable) {
        if (status != null) {
            return merchantRepository.findByStatus(status, pageable);
        }
        return merchantRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void reviewMerchant(Long merchantId, boolean approved, String rejectReason) {
        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new BusinessException("商家不存在", 404));

        if (approved) {
            merchant.setStatus(MerchantStatus.APPROVED);
            // 升级用户角色
            User user = merchant.getUser();
            user.setRole(UserRole.MERCHANT);
            userRepository.save(user);
        } else {
            merchant.setStatus(MerchantStatus.REJECTED);
        }

        merchantRepository.save(merchant);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getOrders(OrderStatus status, OrderType orderType, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatus(status, pageable);
        }
        if (orderType != null) {
            return orderRepository.findByOrderType(orderType, pageable);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FinanceRecord> getFinanceRecords(Long merchantId, FinanceStatus status, Pageable pageable) {
        if (merchantId != null && status != null) {
            return financeRecordRepository.findByMerchantIdAndStatus(merchantId, status, pageable);
        }
        if (merchantId != null) {
            return financeRecordRepository.findByMerchantId(merchantId, pageable);
        }
        if (status != null) {
            return financeRecordRepository.findByStatus(status, pageable);
        }
        return financeRecordRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    @Transactional
    public void settleFinance(Long recordId) {
        FinanceRecord record = financeRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException("财务记录不存在", 404));

        record.setStatus(FinanceStatus.SETTLED);
        record.setSettledAt(LocalDateTime.now());
        financeRecordRepository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Report> getReports(ReportStatus status, Pageable pageable) {
        if (status != null) {
            return reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    @Transactional
    public void handleReport(Long reportId, Long handlerId, String handleResult, boolean approved) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException("举报不存在", 404));

        report.setStatus(approved ? ReportStatus.HANDLED : ReportStatus.REJECTED);
        report.setHandlerId(handlerId);
        report.setHandleResult(handleResult);
        report.setHandledAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Announcement> getAnnouncements() {
        return announcementRepository.findByStatusTrueOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public Announcement createAnnouncement(String title, String content) {
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setStatus(true);
        return announcementRepository.save(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Banner> getBanners() {
        return bannerRepository.findByStatusTrueOrderBySortAsc();
    }

    @Override
    @Transactional
    public Banner createBanner(String title, String imageUrl, String linkUrl, String module, Integer sort) {
        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setImageUrl(imageUrl);
        banner.setLinkUrl(linkUrl);
        banner.setModule(module);
        banner.setSort(sort != null ? sort : 0);
        banner.setStatus(true);
        return bannerRepository.save(banner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfig> getConfigs() {
        return systemConfigRepository.findAll();
    }

    @Override
    @Transactional
    public void updateConfig(String key, String value, String remark) {
        SystemConfig config = systemConfigRepository.findByKey(key).orElse(null);
        if (config == null) {
            config = new SystemConfig();
            config.setKey(key);
        }
        config.setValue(value);
        config.setRemark(remark);
        config.setUpdatedAt(LocalDateTime.now());
        systemConfigRepository.save(config);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MerchantApplication> getMerchantApplications(MerchantStatus status, Pageable pageable) {
        if (status != null) {
            return merchantApplicationRepository.findByStatus(status, pageable);
        }
        return merchantApplicationRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void reviewMerchantApplication(Long applicationId, boolean approved, String rejectReason, Long reviewerId) {
        MerchantApplication application = merchantApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException("申请不存在", 404));

        application.setStatus(approved ? MerchantStatus.APPROVED : MerchantStatus.REJECTED);
        application.setRejectReason(rejectReason);
        application.setReviewerId(reviewerId);
        application.setReviewedAt(LocalDateTime.now());
        merchantApplicationRepository.save(application);

        if (approved) {
            // 创建商家记录
            Merchant merchant = new Merchant();
            merchant.setUser(application.getUser());
            merchant.setShopName(application.getShopName());
            merchant.setModule(application.getModule());
            merchant.setContactName(application.getContactName());
            merchant.setContactPhone(application.getContactPhone());
            merchant.setLicenseNo(application.getLicenseNo());
            merchant.setLicenseImage(application.getLicenseImage());
            merchant.setIdCardImage(application.getIdCardImage());
            merchant.setStatus(MerchantStatus.APPROVED);
            merchantRepository.save(merchant);

            // 升级用户角色
            User user = application.getUser();
            user.setRole(UserRole.MERCHANT);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OperationLog> getLogs(Pageable pageable) {
        return operationLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Recommendation> getRecommendations() {
        return recommendationRepository.findByStatusTrueOrderBySortAsc();
    }

    @Override
    @Transactional
    public Recommendation createRecommendation(String name, String targetType, Long targetId, String module, Integer sort) {
        Recommendation recommendation = new Recommendation();
        recommendation.setName(name);
        recommendation.setTargetType(targetType);
        recommendation.setTargetId(targetId);
        recommendation.setModule(module);
        recommendation.setSort(sort != null ? sort : 0);
        recommendation.setStatus(true);
        return recommendationRepository.save(recommendation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SensitiveWord> getSensitiveWords() {
        return sensitiveWordRepository.findAll();
    }

    @Override
    @Transactional
    public SensitiveWord addSensitiveWord(String word, Integer level) {
        if (sensitiveWordRepository.existsByWord(word)) {
            throw new BusinessException("敏感词已存在");
        }

        SensitiveWord sensitiveWord = new SensitiveWord();
        sensitiveWord.setWord(word);
        sensitiveWord.setLevel(level != null ? level : 1);
        sensitiveWord.setStatus(true);
        return sensitiveWordRepository.save(sensitiveWord);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Refund> getRefunds(RefundStatus status, Pageable pageable) {
        if (status != null) {
            return refundRepository.findByStatus(status, pageable);
        }
        return refundRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void approveRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException("退款记录不存在", 404));
        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new BusinessException("该退款不在待审批状态");
        }
        paymentService.handleRefundSuccess(refund.getOrder().getId());
    }
}
