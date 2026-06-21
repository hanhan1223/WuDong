package com.wudong.service;

import com.wudong.entity.SensitiveWord;

import java.util.List;

/**
 * 内容审核服务 - 等价于 Node.js 版本的 ModerationService
 */
public interface ModerationService {

    /**
     * 内容审核
     * @return true=通过, false=不通过
     */
    boolean moderateContent(String content);

    /**
     * 内容审核并处理用户（带用户ID）
     */
    boolean moderateContentWithUser(String content, Long userId);
}
