package com.wudong.common.enums;

public enum OrderType {
    PRODUCT("商品"),
    TABLE_BOOKING("餐桌预订"),
    ACCOMMODATION("住宿"),
    TICKET("门票"),
    ROUTE("路线");

    private final String description;

    OrderType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
