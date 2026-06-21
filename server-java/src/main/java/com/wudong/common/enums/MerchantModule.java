package com.wudong.common.enums;

public enum MerchantModule {
    CLOTHING("衣"),
    DINING("食"),
    ACCOMMODATION("住"),
    TRAVEL("行");

    private final String description;

    MerchantModule(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
