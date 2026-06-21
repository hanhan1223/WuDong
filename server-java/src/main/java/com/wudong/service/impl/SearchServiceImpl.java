package com.wudong.service.impl;

import com.wudong.entity.Product;
import com.wudong.entity.Post;
import com.wudong.entity.SearchHistory;
import com.wudong.entity.User;
import com.wudong.repository.ProductRepository;
import com.wudong.repository.PostRepository;
import com.wudong.repository.SearchHistoryRepository;
import com.wudong.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 搜索服务实现 - 等价于 Node.js 版本的 SearchService
 */
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ProductRepository productRepository;
    private final PostRepository postRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    /**
     * 综合搜索
     */
    @Override
    public Map<String, Object> search(String keyword, String type, Long userId, Pageable pageable) {
        Map<String, Object> result = new HashMap<>();

        if ("product".equals(type)) {
            Page<Product> products = productRepository.searchByKeyword(keyword, pageable);
            result.put("products", products);
        } else if ("post".equals(type)) {
            Page<Post> posts = postRepository.searchByKeyword(keyword, pageable);
            result.put("posts", posts);
        } else {
            // 搜索商品和帖子
            Page<Product> products = productRepository.searchByKeyword(keyword, PageRequest.of(0, 10));
            Page<Post> posts = postRepository.searchByKeyword(keyword, PageRequest.of(0, 10));
            result.put("products", products);
            result.put("posts", posts);
        }

        // 记录搜索历史
        if (userId != null) {
            recordSearchHistory(userId, keyword, type);
        }

        return result;
    }

    /**
     * 记录搜索历史
     */
    @Override
    @Transactional
    public void recordSearchHistory(Long userId, String keyword, String module) {
        SearchHistory history = new SearchHistory();
        history.setUser(new User());
        history.getUser().setId(userId);
        history.setKeyword(keyword);
        history.setModule(module);
        searchHistoryRepository.save(history);
    }

    /**
     * 获取搜索历史
     */
    @Override
    public List<SearchHistory> getSearchHistory(Long userId) {
        return searchHistoryRepository.findDistinctKeywordsByUserId(userId, PageRequest.of(0, 20));
    }
}
