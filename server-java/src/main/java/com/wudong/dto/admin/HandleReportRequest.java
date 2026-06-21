package com.wudong.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HandleReportRequest {

    @NotNull(message = "处理结果不能为空")
    private Boolean approved;

    private String handleResult;
}
