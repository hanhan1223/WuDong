package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.entity.SearchHistory;
import com.wudong.security.SecurityUtils;
import com.wudong.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "搜索")
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @Operation(summary = "综合搜索")
    @GetMapping
    public ApiResponse<Map<String, Object>> search(
            @RequestParam(name = "q") String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.getCurrentUserIdOrNull();
        return ApiResponse.success(searchService.search(keyword, type, userId, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取搜索历史")
    @GetMapping("/history")
    public ApiResponse<List<SearchHistory>> getSearchHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(searchService.getSearchHistory(userId));
    }
}
