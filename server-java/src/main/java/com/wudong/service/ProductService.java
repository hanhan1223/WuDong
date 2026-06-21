package com.wudong.service;

import com.wudong.common.enums.ProductStatus;
import com.wudong.entity.Product;
import com.wudong.entity.ProductCategory;
import com.wudong.entity.ProductSku;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * 商品服务 - 等价于 Node.js 版本的 ProductService
 */
public interface ProductService {

    /**
     * 获取商品列表
     */
    Page<Product> getProducts(Long categoryId, String keyword, ProductStatus status, String orderBy, Pageable pageable);

    /**
     * 获取热门商品
     */
    List<Product> getHotProducts(int limit);

    /**
     * 获取分类树
     */
    List<ProductCategory> getCategoryTree();

    /**
     * 获取商品详情
     */
    Product getProductById(Long id);

    /**
     * 商家创建商品
     */
    Product createProduct(Long merchantId, Long categoryId, String title, String subtitle,
                          String mainImage, BigDecimal price, BigDecimal marketPrice, Integer stock,
                          String detail, String craftIntro, List<ProductSku> skus);

    /**
     * 商家更新商品
     */
    Product updateProduct(Long productId, Long merchantId, Long categoryId, String title,
                          String subtitle, String mainImage, BigDecimal price, BigDecimal marketPrice,
                          Integer stock, String detail, String craftIntro, ProductStatus status);

    /**
     * 商家删除商品
     */
    void deleteProduct(Long productId, Long merchantId);
}
