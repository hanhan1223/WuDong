package com.wudong.service;

import com.wudong.common.enums.MessageType;
import com.wudong.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 消息服务 - 等价于 Node.js 版本的 MessageService
 */
public interface MessageService {

    /**
     * 创建消息
     */
    Message createMessage(Long userId, MessageType type, String title, String content);

    /**
     * 获取消息列表（支持组合过滤）
     */
    Page<Message> getMessages(Long userId, MessageType type, Boolean isRead, Pageable pageable);

    /**
     * 标记单条消息已读
     */
    void markAsRead(Long messageId, Long userId);

    /**
     * 标记所有消息已读
     */
    void markAllAsRead(Long userId);

    /**
     * 获取未读消息数
     */
    long getUnreadCount(Long userId);
}
