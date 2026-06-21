package com.wudong.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最多200字")
    private String title;

    @NotBlank(message = "内容不能为空")
    @Size(max = 5000, message = "内容最多5000字")
    private String content;

    private List<String> images;
    private String videoUrl;
    private Long locationId;
    private String locationType;
    private String locationName;
    private List<Long> topicIds;
}
