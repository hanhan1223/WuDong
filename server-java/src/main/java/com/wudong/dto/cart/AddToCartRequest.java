package com.wudong.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {

    @NotNull(message = "商品ID不能为空")
    private Long productId;

    private Long skuId;

    @Min(value = 1, message = "数量至少为1")
    private Integer quantity = 1;
}
