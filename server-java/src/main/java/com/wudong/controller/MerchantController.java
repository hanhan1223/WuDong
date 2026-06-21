package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.merchant.MerchantApplyRequest;
import com.wudong.entity.MerchantApplication;
import com.wudong.security.SecurityUtils;
import com.wudong.service.MerchantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "商家")
@RestController
@RequestMapping("/api/merchant")
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    @Operation(summary = "提交商家申请")
    @PostMapping("/apply")
    public ApiResponse<MerchantApplication> apply(@Valid @RequestBody MerchantApplyRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        MerchantApplication application = merchantService.apply(userId, request.getShopName(),
                request.getModule(), request.getContactName(), request.getContactPhone(),
                request.getLicenseNo(), request.getLicenseImage(), request.getIdCardImage());
        return ApiResponse.success(application, "申请已提交");
    }

    @Operation(summary = "获取我的申请历史")
    @GetMapping("/applications")
    public ApiResponse<List<MerchantApplication>> getMyApplications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(merchantService.getMyApplications(userId));
    }
}
