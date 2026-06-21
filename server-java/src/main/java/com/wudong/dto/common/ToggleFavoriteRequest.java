package com.wudong.dto.common;

import com.wudong.common.enums.FavoriteTargetType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ToggleFavoriteRequest {

    @NotNull(message = "收藏目标类型不能为空")
    private FavoriteTargetType targetType;

    @NotNull(message = "收藏目标ID不能为空")
    private Long targetId;
}
