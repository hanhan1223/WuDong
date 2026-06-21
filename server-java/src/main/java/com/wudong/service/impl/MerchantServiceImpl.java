package com.wudong.service.impl;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.MerchantStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.MerchantApplication;
import com.wudong.entity.User;
import com.wudong.repository.MerchantApplicationRepository;
import com.wudong.service.MerchantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 商家服务实现 - 等价于 Node.js 版本的 MerchantService
 */
@Service
@RequiredArgsConstructor
public class MerchantServiceImpl implements MerchantService {

    private final MerchantApplicationRepository merchantApplicationRepository;

    /**
     * 提交商家申请
     */
    @Override
    @Transactional
    public MerchantApplication apply(Long userId, String shopName, MerchantModule module,
                                      String contactName, String contactPhone, String licenseNo,
                                      String licenseImage, String idCardImage) {
        // 检查是否有待审核的申请
        MerchantApplication existing = merchantApplicationRepository.findByUserIdAndStatus(userId, MerchantStatus.PENDING).orElse(null);
        if (existing != null) {
            throw new BusinessException("您已有待审核的申请，请等待审核结果");
        }

        MerchantApplication application = new MerchantApplication();
        application.setUser(new User());
        application.getUser().setId(userId);
        application.setShopName(shopName);
        application.setModule(module);
        application.setContactName(contactName);
        application.setContactPhone(contactPhone);
        application.setLicenseNo(licenseNo);
        application.setLicenseImage(licenseImage);
        application.setIdCardImage(idCardImage);
        application.setStatus(MerchantStatus.PENDING);

        return merchantApplicationRepository.save(application);
    }

    /**
     * 获取用户的申请历史
     */
    @Override
    public List<MerchantApplication> getMyApplications(Long userId) {
        return merchantApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 管理员获取申请列表
     */
    @Override
    public Page<MerchantApplication> getApplications(MerchantStatus status, Pageable pageable) {
        if (status != null) {
            return merchantApplicationRepository.findByStatus(status, pageable);
        }
        return merchantApplicationRepository.findAll(pageable);
    }
}
