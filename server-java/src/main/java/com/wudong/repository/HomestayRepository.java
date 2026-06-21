package com.wudong.repository;

import com.wudong.entity.Homestay;
import com.wudong.common.enums.HomestayStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HomestayRepository extends JpaRepository<Homestay, Long> {

    Page<Homestay> findByStatus(HomestayStatus status, Pageable pageable);

    @Query("SELECT h FROM Homestay h WHERE h.status = com.wudong.common.enums.HomestayStatus.ACTIVE AND (h.name LIKE %:keyword% OR h.address LIKE %:keyword%)")
    Page<Homestay> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Homestay> findByMerchantId(Long merchantId, Pageable pageable);
}
