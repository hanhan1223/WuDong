package com.wudong.repository;

import com.wudong.entity.ScenicSpot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScenicSpotRepository extends JpaRepository<ScenicSpot, Long> {

    Page<ScenicSpot> findByStatusTrue(Pageable pageable);

    @Query("SELECT s FROM ScenicSpot s WHERE s.status = true AND s.name LIKE %:keyword%")
    Page<ScenicSpot> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
