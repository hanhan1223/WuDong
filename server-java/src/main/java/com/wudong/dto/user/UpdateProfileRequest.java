package com.wudong.dto.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nickname;
    private String avatar;
    private Integer gender;
    private String region;
    private String bio;
}
