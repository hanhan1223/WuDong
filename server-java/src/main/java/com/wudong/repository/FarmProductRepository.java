package com.wudong.repository;

import com.wudong.entity.FarmProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmProductRepository extends JpaRepository<FarmProduct, Long> {

    Page<FarmProduct> findByStatusTrue(Pageable pageable);

    Page<FarmProduct> findByCategoryIdAndStatusTrue(Long categoryId, Pageable pageable);

    @Query("SELECT fp FROM FarmProduct fp WHERE fp.status = true AND fp.name LIKE %:keyword%")
    Page<FarmProduct> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT fp FROM FarmProduct fp WHERE fp.status = true AND fp.categoryId = :categoryId AND fp.name LIKE %:keyword%")
    Page<FarmProduct> searchByKeywordAndCategory(@Param("keyword") String keyword, @Param("categoryId") Long categoryId, Pageable pageable);
}
