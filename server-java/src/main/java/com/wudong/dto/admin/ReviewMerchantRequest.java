package com.wudong.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewMerchantRequest {

    @NotNull(message = "审核结果不能为空")
    private Boolean approved;

    private String rejectReason;
}
