package com.wudong.service;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.MerchantStatus;
import com.wudong.entity.MerchantApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 商家服务 - 等价于 Node.js 版本的 MerchantService
 */
public interface MerchantService {

    /**
     * 提交商家申请
     */
    MerchantApplication apply(Long userId, String shopName, MerchantModule module,
                              String contactName, String contactPhone, String licenseNo,
                              String licenseImage, String idCardImage);

    /**
     * 获取用户的申请历史
     */
    List<MerchantApplication> getMyApplications(Long userId);

    /**
     * 管理员获取申请列表
     */
    Page<MerchantApplication> getApplications(MerchantStatus status, Pageable pageable);
}
