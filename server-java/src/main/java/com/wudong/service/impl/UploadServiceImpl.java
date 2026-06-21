package com.wudong.service.impl;

import com.wudong.common.exception.BusinessException;
import com.wudong.service.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 文件上传服务实现 - 等价于 Node.js 版本的 UploadService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    @Value("${upload.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${upload.max-size:5242880}")
    private long maxSize;

    @Value("${upload.allowed-types:jpg,jpeg,png,webp,gif}")
    private String allowedTypes;

    /**
     * 上传图片
     */
    @Override
    public String uploadImage(MultipartFile file) {
        // 检查文件大小
        if (file.getSize() > maxSize) {
            throw new BusinessException("文件大小超过限制（最大5MB）");
        }

        // 检查文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("文件名不能为空");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!allowedTypes.contains(extension)) {
            throw new BusinessException("不支持的文件类型，允许: " + allowedTypes);
        }

        // 生成唯一文件名
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        try {
            // 创建上传目录
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 保存文件
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            // 返回访问路径
            return "/uploads/" + filename;
        } catch (IOException e) {
            log.error("文件上传失败: {}", e.getMessage(), e);
            throw new BusinessException("文件上传失败");
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0) {
            return "";
        }
        return filename.substring(lastDot + 1);
    }
}
