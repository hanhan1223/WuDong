package com.wudong.dto.cart;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ToggleSelectRequest {

    @NotNull(message = "购物车项ID不能为空")
    private Long id;
}
