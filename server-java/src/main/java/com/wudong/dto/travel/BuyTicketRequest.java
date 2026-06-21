package com.wudong.dto.travel;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BuyTicketRequest {

    @NotNull(message = "票种ID不能为空")
    private Long ticketTypeId;

    @NotNull(message = "数量不能为空")
    @Min(value = 1, message = "数量至少1张")
    @Max(value = 10, message = "数量最多10张")
    private Integer quantity;

    @NotBlank(message = "有效期不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "日期格式不正确")
    private String validDate;

    @NotBlank(message = "联系人姓名不能为空")
    private String contactName;

    @NotBlank(message = "联系人手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;
}
