package com.wudong.dto.restaurant;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBookingRequest {

    @NotNull(message = "预订日期不能为空")
    private LocalDate bookingDate;

    @NotNull(message = "时段ID不能为空")
    private Long timeSlotId;

    @NotNull(message = "用餐人数不能为空")
    @Min(value = 1, message = "用餐人数至少1人")
    @Max(value = 20, message = "用餐人数最多20人")
    private Integer guestCount;

    @NotBlank(message = "联系人姓名不能为空")
    private String contactName;

    @NotBlank(message = "联系人手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;

    private String remark;
}
