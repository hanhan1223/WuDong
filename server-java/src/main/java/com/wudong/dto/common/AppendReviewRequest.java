package com.wudong.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AppendReviewRequest {

    @NotBlank(message = "追评内容不能为空")
    @Size(max = 1000, message = "追评内容最多1000字")
    private String content;
}
