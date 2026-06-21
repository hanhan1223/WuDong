package com.wudong.repository;

import com.wudong.entity.FinanceRecord;
import com.wudong.common.enums.FinanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FinanceRecordRepository extends JpaRepository<FinanceRecord, Long> {

    Page<FinanceRecord> findByMerchantId(Long merchantId, Pageable pageable);

    Page<FinanceRecord> findByStatus(FinanceStatus status, Pageable pageable);

    Page<FinanceRecord> findByMerchantIdAndStatus(Long merchantId, FinanceStatus status, Pageable pageable);

    Page<FinanceRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT fr FROM FinanceRecord fr WHERE fr.status = 'PENDING' AND fr.createdAt < :threshold")
    List<FinanceRecord> findPendingBefore(@Param("threshold") LocalDateTime threshold);
}
