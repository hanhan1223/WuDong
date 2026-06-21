package com.wudong.repository;

import com.wudong.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    List<ProductCategory> findByStatusTrueOrderBySortAsc();

    List<ProductCategory> findByParentIdIsNullAndStatusTrueOrderBySortAsc();

    List<ProductCategory> findByParentIdAndStatusTrueOrderBySortAsc(Long parentId);
}
