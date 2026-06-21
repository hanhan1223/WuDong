package com.wudong.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddSensitiveWordRequest {

    @NotBlank(message = "敏感词不能为空")
    @Size(max = 50, message = "敏感词最多50字")
    private String word;

    private Integer level = 1;
}
