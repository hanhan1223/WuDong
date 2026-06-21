package com.wudong.repository;

import com.wudong.entity.FarmCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmCategoryRepository extends JpaRepository<FarmCategory, Long> {

    List<FarmCategory> findByStatusTrueOrderBySortAsc();
}
