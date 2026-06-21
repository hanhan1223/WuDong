package com.wudong.common.enums;

/**
 * 订单状态枚举 - 与 Prisma schema 完全一致
 */
public enum OrderStatus {
    PENDING_PAYMENT("待支付"),
    PAID("已支付/待确认"),
    CONFIRMED("已确认"),
    IN_PROGRESS("进行中"),
    COMPLETED("已完成"),
    CANCELLED("已取消"),
    REFUNDING("退款中"),
    REFUNDED("已退款");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
