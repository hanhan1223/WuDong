package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.enums.ProductStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.CacheService;
import com.wudong.service.ProductService;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 商品服务实现
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductSkuRepository skuRepository;
    private final ProductImageRepository imageRepository;
    private final MerchantRepository merchantRepository;
    private final CacheService cacheService;

    /**
     * 获取商品列表
     */
    public Page<Product> getProducts(Long categoryId, String keyword, ProductStatus status, String orderBy, Pageable pageable) {
        ProductStatus queryStatus = status != null ? status : ProductStatus.ACTIVE;

        if (keyword != null && !keyword.isEmpty()) {
            if (categoryId != null) {
                return productRepository.searchByKeywordAndCategory(keyword, categoryId, pageable);
            }
            return productRepository.searchByKeyword(keyword, pageable);
        }

        if (categoryId != null) {
            return productRepository.findByCategoryIdAndStatus(categoryId, queryStatus, pageable);
        }

        return productRepository.findByStatus(queryStatus, pageable);
    }

    /**
     * 获取热门商品
     */
    public List<Product> getHotProducts(int limit) {
        String cacheKey = BusinessConstants.CACHE_PREFIX_HOT_PRODUCTS + ":" + limit;
        List<Product> products = cacheService.get(cacheKey);
        if (products != null) {
            return products;
        }

        products = productRepository.findByStatusOrderBySalesDesc(ProductStatus.ACTIVE, PageRequest.of(0, limit));
        cacheService.set(cacheKey, products, BusinessConstants.CACHE_TTL_SHORT);
        return products;
    }

    /**
     * 获取分类树
     */
    public List<ProductCategory> getCategoryTree() {
        String cacheKey = BusinessConstants.CACHE_PREFIX_CATEGORY + "tree";
        List<ProductCategory> categories = cacheService.get(cacheKey);
        if (categories != null) {
            return categories;
        }

        categories = categoryRepository.findByParentIdIsNullAndStatusTrueOrderBySortAsc();
        cacheService.set(cacheKey, categories, BusinessConstants.CACHE_TTL_MEDIUM);
        return categories;
    }

    /**
     * 获取商品详情
     */
    public Product getProductById(Long id) {
        String cacheKey = BusinessConstants.CACHE_PREFIX_PRODUCT + id;
        Product product = cacheService.get(cacheKey);
        if (product != null) {
            return product;
        }

        product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("商品不存在", 404));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BusinessException("商品已下架");
        }

        // 加载 SKU 和图片
        product.setSkus(skuRepository.findByProductId(id));
        product.setImages(imageRepository.findByProductIdOrderBySortAsc(id));

        cacheService.set(cacheKey, product, BusinessConstants.CACHE_TTL_SHORT);
        return product;
    }

    /**
     * 商家创建商品
     */
    @Transactional
    public Product createProduct(Long merchantId, Long categoryId, String title, String subtitle,
                                  String mainImage, BigDecimal price, BigDecimal marketPrice, Integer stock,
                                  String detail, String craftIntro, List<ProductSku> skus) {
        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new BusinessException("商家不存在", 404));

        ProductCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException("分类不存在", 404));

        Product product = new Product();
        product.setMerchant(merchant);
        product.setCategory(category);
        product.setTitle(title);
        product.setSubtitle(subtitle);
        product.setMainImage(mainImage);
        product.setPrice(price);
        product.setMarketPrice(marketPrice);
        product.setStock(stock != null ? stock : 0);
        product.setDetail(detail);
        product.setCraftIntro(craftIntro);
        product.setStatus(ProductStatus.DRAFT);

        product = productRepository.save(product);

        // 保存 SKU
        if (skus != null) {
            for (ProductSku sku : skus) {
                sku.setProduct(product);
                skuRepository.save(sku);
            }
        }

        return product;
    }

    /**
     * 商家更新商品
     */
    @Transactional
    public Product updateProduct(Long productId, Long merchantId, Long categoryId, String title,
                                  String subtitle, String mainImage, BigDecimal price, BigDecimal marketPrice,
                                  Integer stock, String detail, String craftIntro, ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("商品不存在", 404));

        if (!product.getMerchant().getId().equals(merchantId)) {
            throw new BusinessException("无权操作此商品", 403);
        }

        if (categoryId != null) {
            ProductCategory category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new BusinessException("分类不存在", 404));
            product.setCategory(category);
        }
        if (title != null) product.setTitle(title);
        if (subtitle != null) product.setSubtitle(subtitle);
        if (mainImage != null) product.setMainImage(mainImage);
        if (price != null) product.setPrice(price);
        if (marketPrice != null) product.setMarketPrice(marketPrice);
        if (stock != null) product.setStock(stock);
        if (detail != null) product.setDetail(detail);
        if (craftIntro != null) product.setCraftIntro(craftIntro);
        if (status != null) product.setStatus(status);

        product = productRepository.save(product);
        cacheService.del(BusinessConstants.CACHE_PREFIX_PRODUCT + productId);
        return product;
    }

    /**
     * 商家删除商品
     */
    @Transactional
    public void deleteProduct(Long productId, Long merchantId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("商品不存在", 404));

        if (!product.getMerchant().getId().equals(merchantId)) {
            throw new BusinessException("无权操作此商品", 403);
        }

        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
        cacheService.del(BusinessConstants.CACHE_PREFIX_PRODUCT + productId);
    }
}
