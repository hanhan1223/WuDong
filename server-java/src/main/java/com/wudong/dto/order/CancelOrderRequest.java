package com.wudong.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelOrderRequest {

    @NotBlank(message = "取消原因不能为空")
    @Size(max = 500, message = "取消原因最多500字")
    private String reason;
}
