package com.wudong.security;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

/**
 * 自定义认证对象 - 存储用户/管理员信息
 */
@Getter
public class UserAuthentication extends AbstractAuthenticationToken {

    private final Long userId;
    private final String role;
    private final String phone;
    private Long adminId;

    public UserAuthentication(Long userId, String role, String phone) {
        super(List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        this.userId = userId;
        this.role = role;
        this.phone = phone;
        setAuthenticated(true);
    }

    public UserAuthentication(Long adminId, String username) {
        super(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        this.userId = null;
        this.role = "ADMIN";
        this.phone = null;
        this.adminId = adminId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return userId != null ? userId : adminId;
    }
}
