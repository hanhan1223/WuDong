package com.wudong.dto.common;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新地址请求 - 所有字段可选（部分更新）
 */
@Data
public class UpdateAddressRequest {

    @Size(max = 50, message = "姓名最多50字")
    private String name;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @Size(max = 50, message = "省份最多50字")
    private String province;

    @Size(max = 50, message = "城市最多50字")
    private String city;

    @Size(max = 50, message = "区县最多50字")
    private String district;

    @Size(max = 200, message = "详细地址最多200字")
    private String detail;

    private Boolean defaulted;
}
