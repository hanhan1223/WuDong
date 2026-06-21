package com.wudong.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRecommendationRequest {

    @NotBlank(message = "推荐名称不能为空")
    @Size(max = 100, message = "名称最多100字")
    private String name;

    @NotBlank(message = "目标类型不能为空")
    private String targetType;

    private Long targetId;

    private String module;

    private Integer sort = 0;
}
