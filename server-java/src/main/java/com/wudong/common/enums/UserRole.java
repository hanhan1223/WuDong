package com.wudong.common.enums;

/**
 * 用户角色枚举
 */
public enum UserRole {
    TOURIST("游客"),
    MERCHANT("商家"),
    ADMIN("管理员");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
