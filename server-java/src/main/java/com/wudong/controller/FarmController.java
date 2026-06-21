package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.entity.FarmCategory;
import com.wudong.entity.FarmProduct;
import com.wudong.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "农产品")
@RestController
@RequestMapping("/api/farm")
@RequiredArgsConstructor
public class FarmController {

    private final RestaurantService restaurantService;

    @Operation(summary = "获取农产品分类")
    @GetMapping("/categories")
    public ApiResponse<List<FarmCategory>> getCategories() {
        return ApiResponse.success(restaurantService.getFarmCategories());
    }

    @Operation(summary = "获取农产品列表")
    @GetMapping("/products")
    public ApiResponse<Page<FarmProduct>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(restaurantService.getFarmProducts(categoryId, keyword, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取农产品详情")
    @GetMapping("/products/{id}")
    public ApiResponse<FarmProduct> getProduct(@PathVariable Long id) {
        return ApiResponse.success(restaurantService.getFarmProductById(id));
    }
}
