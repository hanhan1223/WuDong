package com.wudong.service;

import com.wudong.entity.SearchHistory;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * 搜索服务 - 等价于 Node.js 版本的 SearchService
 */
public interface SearchService {

    /**
     * 综合搜索
     */
    Map<String, Object> search(String keyword, String type, Long userId, Pageable pageable);

    /**
     * 记录搜索历史
     */
    void recordSearchHistory(Long userId, String keyword, String module);

    /**
     * 获取搜索历史
     */
    List<SearchHistory> getSearchHistory(Long userId);
}
