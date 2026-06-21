package com.wudong.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateConfigRequest {

    @NotBlank(message = "配置键不能为空")
    private String key;

    @NotBlank(message = "配置值不能为空")
    private String value;

    private String remark;
}
