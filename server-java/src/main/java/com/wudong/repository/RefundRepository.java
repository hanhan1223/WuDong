package com.wudong.repository;

import com.wudong.entity.Refund;
import com.wudong.common.enums.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    Optional<Refund> findByOrderId(Long orderId);

    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);
}
