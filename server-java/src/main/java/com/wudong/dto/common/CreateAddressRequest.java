package com.wudong.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAddressRequest {

    @NotBlank(message = "收货人姓名不能为空")
    @Size(max = 50, message = "姓名最多50字")
    private String name;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "省份不能为空")
    @Size(max = 50, message = "省份最多50字")
    private String province;

    @NotBlank(message = "城市不能为空")
    @Size(max = 50, message = "城市最多50字")
    private String city;

    @NotBlank(message = "区县不能为空")
    @Size(max = 50, message = "区县最多50字")
    private String district;

    @NotBlank(message = "详细地址不能为空")
    @Size(max = 200, message = "详细地址最多200字")
    private String detail;

    private Boolean defaulted;
}
