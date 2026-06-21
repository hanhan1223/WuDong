package com.wudong.dto.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ApplyRefundRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    /** 退款金额，为空则全额退款 */
    @Min(value = 0, message = "退款金额不能为负数")
    private BigDecimal amount;

    private String reason;
}
