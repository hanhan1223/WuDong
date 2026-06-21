package com.wudong.dto.homestay;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BookRoomRequest {

    @NotNull(message = "房型ID不能为空")
    private Long roomTypeId;

    @NotBlank(message = "入住日期不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "日期格式不正确")
    private String checkIn;

    @NotBlank(message = "退房日期不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "日期格式不正确")
    private String checkOut;

    @NotNull(message = "入住人数不能为空")
    @Min(value = 1, message = "入住人数至少1人")
    @Max(value = 10, message = "入住人数最多10人")
    private Integer guestCount;

    @NotBlank(message = "联系人姓名不能为空")
    private String contactName;

    @NotBlank(message = "联系人手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;
}
