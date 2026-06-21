package com.wudong.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传服务 - 等价于 Node.js 版本的 UploadService
 */
public interface UploadService {

    /**
     * 上传图片
     */
    String uploadImage(MultipartFile file);
}
