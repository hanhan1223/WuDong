package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.enums.MessageType;
import com.wudong.common.enums.UserStatus;
import com.wudong.entity.SensitiveWord;
import com.wudong.entity.User;
import com.wudong.repository.SensitiveWordRepository;
import com.wudong.repository.UserRepository;
import com.wudong.service.CacheService;
import com.wudong.service.MessageService;
import com.wudong.service.ModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 内容审核服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModerationServiceImpl implements ModerationService {

    private final SensitiveWordRepository sensitiveWordRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final CacheService cacheService;

    private static final String CACHE_KEY_SENSITIVE_WORDS = "sensitive_words:active";

    /**
     * 获取敏感词列表（带缓存）
     */
    private List<SensitiveWord> getSensitiveWords() {
        List<SensitiveWord> words = cacheService.get(CACHE_KEY_SENSITIVE_WORDS);
        if (words == null) {
            words = sensitiveWordRepository.findByStatusTrue();
            cacheService.set(CACHE_KEY_SENSITIVE_WORDS, words, BusinessConstants.CACHE_TTL_LONG);
        }
        return words;
    }

    /**
     * 内容审核
     * @return true=通过, false=不通过
     */
    @Transactional
    public boolean moderateContent(String content) {
        if (content == null || content.isEmpty()) {
            return true;
        }

        List<SensitiveWord> sensitiveWords = getSensitiveWords();
        int hitCount = 0;

        for (SensitiveWord word : sensitiveWords) {
            if (content.contains(word.getWord())) {
                hitCount++;
                log.warn("内容审核命中敏感词: {}", word.getWord());
            }
        }

        // 3个以上敏感词触发自动禁言
        if (hitCount >= BusinessConstants.AUTO_MUTE_THRESHOLD) {
            return false;
        }

        return true;
    }

    /**
     * 内容审核并处理用户（带用户ID）
     */
    @Transactional
    public boolean moderateContentWithUser(String content, Long userId) {
        if (content == null || content.isEmpty()) {
            return true;
        }

        List<SensitiveWord> sensitiveWords = getSensitiveWords();
        int hitCount = 0;

        for (SensitiveWord word : sensitiveWords) {
            if (content.contains(word.getWord())) {
                hitCount++;
            }
        }

        if (hitCount >= BusinessConstants.AUTO_MUTE_THRESHOLD) {
            // 自动禁言24小时
            autoMuteUser(userId);
            return false;
        }

        return true;
    }

    /**
     * 自动禁言用户
     */
    private void autoMuteUser(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                user.setStatus(UserStatus.MUTED);
                userRepository.save(user);

                // 发送系统消息通知
                messageService.createMessage(userId, MessageType.SYSTEM, "账号禁言通知",
                        "您的账号因发布违规内容已被禁言" + BusinessConstants.AUTO_MUTE_HOURS + "小时");

                log.warn("用户 {} 因敏感内容自动禁言 {} 小时", userId, BusinessConstants.AUTO_MUTE_HOURS);
            }
        } catch (Exception e) {
            log.error("自动禁言用户失败: {}", e.getMessage(), e);
        }
    }
}
