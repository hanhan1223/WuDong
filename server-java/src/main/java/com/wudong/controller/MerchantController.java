package com.wudong.controller;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.response.ApiResponse;
import com.wudong.entity.MerchantApplication;
import com.wudong.security.SecurityUtils;
import com.wudong.service.MerchantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "商家")
@RestController
@RequestMapping("/api/merchant")
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    @Operation(summary = "提交商家申请")
    @PostMapping("/apply")
    public ApiResponse<MerchantApplication> apply(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        MerchantApplication application = merchantService.apply(userId,
                body.get("shopName").toString(),
                MerchantModule.valueOf(body.get("module").toString()),
                body.get("contactName") != null ? body.get("contactName").toString() : null,
                body.get("contactPhone") != null ? body.get("contactPhone").toString() : null,
                body.get("licenseNo") != null ? body.get("licenseNo").toString() : null,
                body.get("licenseImage") != null ? body.get("licenseImage").toString() : null,
                body.get("idCardImage") != null ? body.get("idCardImage").toString() : null);
        return ApiResponse.success(application, "申请已提交");
    }

    @Operation(summary = "获取我的申请历史")
    @GetMapping("/applications")
    public ApiResponse<List<MerchantApplication>> getMyApplications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(merchantService.getMyApplications(userId));
    }
}
