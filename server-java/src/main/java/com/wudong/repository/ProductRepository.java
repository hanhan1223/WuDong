package com.wudong.repository;

import com.wudong.entity.Product;
import com.wudong.common.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategoryIdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND (p.title LIKE %:keyword% OR p.subtitle LIKE %:keyword% OR p.craftIntro LIKE %:keyword%)")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.category.id = :categoryId AND (p.title LIKE %:keyword% OR p.subtitle LIKE %:keyword%)")
    Page<Product> searchByKeywordAndCategory(@Param("keyword") String keyword, @Param("categoryId") Long categoryId, Pageable pageable);

    List<Product> findByStatusOrderBySalesDesc(ProductStatus status, Pageable pageable);

    Page<Product> findByMerchantId(Long merchantId, Pageable pageable);

    long countByStatus(ProductStatus status);
}
