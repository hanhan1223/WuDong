package com.wudong.repository;

import com.wudong.entity.OperationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {

    Page<OperationLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OperationLog> findByOperatorIdOrderByCreatedAtDesc(Long operatorId, Pageable pageable);
}
