package com.wudong.dto.order;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull(message = "订单类型不能为空")
    private OrderType orderType;

    private MerchantModule module;

    @NotEmpty(message = "订单项不能为空")
    @Valid
    private List<OrderItemRequest> items;

    private String remark;

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "商品ID不能为空")
        private Long productId;

        @NotBlank(message = "商品名称不能为空")
        private String productName;

        private String productImage;
        private Long skuId;
        private String skuName;

        @NotNull(message = "价格不能为空")
        private BigDecimal price;

        @NotNull(message = "数量不能为空")
        private Integer quantity;
    }
}
