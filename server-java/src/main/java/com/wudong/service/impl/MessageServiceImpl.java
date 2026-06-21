package com.wudong.service.impl;

import com.wudong.common.enums.MessageType;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.Message;
import com.wudong.entity.User;
import com.wudong.repository.MessageRepository;
import com.wudong.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 消息服务实现 - 等价于 Node.js 版本的 MessageService
 */
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    /**
     * 创建消息
     */
    @Override
    @Transactional
    public Message createMessage(Long userId, MessageType type, String title, String content) {
        Message message = new Message();
        message.setUser(new User());
        message.getUser().setId(userId);
        message.setType(type);
        message.setTitle(title);
        message.setContent(content);
        message.setRead(false);
        return messageRepository.save(message);
    }

    /**
     * 获取消息列表（支持组合过滤）
     */
    @Override
    public Page<Message> getMessages(Long userId, MessageType type, Boolean isRead, Pageable pageable) {
        if (type != null && isRead != null) {
            return messageRepository.findByUserIdAndTypeAndReadOrderByCreatedAtDesc(userId, type, isRead, pageable);
        }
        if (type != null) {
            return messageRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
        }
        if (isRead != null) {
            return messageRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, isRead, pageable);
        }
        return messageRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 标记单条消息已读
     */
    @Override
    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException("消息不存在", 404));

        if (!message.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此消息", 403);
        }

        message.setRead(true);
        messageRepository.save(message);
    }

    /**
     * 标记所有消息已读
     */
    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        messageRepository.markAllAsRead(userId);
    }

    /**
     * 获取未读消息数
     */
    @Override
    public long getUnreadCount(Long userId) {
        return messageRepository.countByUserIdAndReadFalse(userId);
    }
}
