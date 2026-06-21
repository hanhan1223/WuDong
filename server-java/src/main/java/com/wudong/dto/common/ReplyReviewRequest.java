package com.wudong.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReplyReviewRequest {

    @NotBlank(message = "回复内容不能为空")
    @Size(max = 500, message = "回复内容最多500字")
    private String content;
}
