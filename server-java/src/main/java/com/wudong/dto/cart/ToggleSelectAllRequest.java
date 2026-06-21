package com.wudong.dto.cart;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ToggleSelectAllRequest {

    @NotNull(message = "selected 不能为空")
    private Boolean selected;
}
