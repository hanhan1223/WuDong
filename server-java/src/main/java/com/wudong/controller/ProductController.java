package com.wudong.controller;

import com.wudong.common.enums.ProductStatus;
import com.wudong.common.response.ApiResponse;
import com.wudong.dto.product.CreateProductRequest;
import com.wudong.dto.product.UpdateProductRequest;
import com.wudong.entity.Product;
import com.wudong.entity.ProductCategory;
import com.wudong.security.SecurityUtils;
import com.wudong.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "商品")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "获取商品列表")
    @GetMapping
    public ApiResponse<Page<Product>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String orderBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Page<Product> products = productService.getProducts(categoryId, keyword, status, orderBy,
                PageRequest.of(page - 1, pageSize));
        return ApiResponse.success(products);
    }

    @Operation(summary = "获取热门商品")
    @GetMapping("/hot")
    public ApiResponse<List<Product>> getHotProducts(@RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(productService.getHotProducts(limit));
    }

    @Operation(summary = "获取分类树")
    @GetMapping("/categories")
    public ApiResponse<List<ProductCategory>> getCategories() {
        return ApiResponse.success(productService.getCategoryTree());
    }

    @Operation(summary = "获取商品详情")
    @GetMapping("/{id}")
    public ApiResponse<Product> getProduct(@PathVariable Long id) {
        return ApiResponse.success(productService.getProductById(id));
    }

    @Operation(summary = "创建商品")
    @PostMapping
    public ApiResponse<Product> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Long merchantId = SecurityUtils.getCurrentUserId(); // 简化：实际应从商家表查询
        Product product = productService.createProduct(merchantId, request.getCategoryId(), request.getTitle(),
                request.getSubtitle(), request.getMainImage(), request.getPrice(), request.getMarketPrice(),
                request.getStock(), request.getDetail(), request.getCraftIntro(), null);
        return ApiResponse.success(product, "创建成功");
    }

    @Operation(summary = "更新商品")
    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        Long merchantId = SecurityUtils.getCurrentUserId();
        Product product = productService.updateProduct(id, merchantId, request.getCategoryId(), request.getTitle(),
                request.getSubtitle(), request.getMainImage(), request.getPrice(), request.getMarketPrice(),
                request.getStock(), request.getDetail(), request.getCraftIntro(), request.getStatus());
        return ApiResponse.success(product, "更新成功");
    }

    @Operation(summary = "删除商品")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        Long merchantId = SecurityUtils.getCurrentUserId();
        productService.deleteProduct(id, merchantId);
        return ApiResponse.success(null, "删除成功");
    }
}
