package com.wudong.dto.merchant;

import com.wudong.common.enums.MerchantModule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MerchantApplyRequest {

    @NotBlank(message = "店铺名称不能为空")
    @Size(max = 100, message = "店铺名称最多100字")
    private String shopName;

    @NotNull(message = "经营模块不能为空")
    private MerchantModule module;

    @Size(max = 50, message = "联系人姓名最多50字")
    private String contactName;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;

    @Size(max = 50, message = "营业执照号最多50字")
    private String licenseNo;

    private String licenseImage;

    private String idCardImage;
}
