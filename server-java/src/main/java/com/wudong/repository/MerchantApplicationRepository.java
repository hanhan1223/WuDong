package com.wudong.repository;

import com.wudong.entity.MerchantApplication;
import com.wudong.common.enums.MerchantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MerchantApplicationRepository extends JpaRepository<MerchantApplication, Long> {

    List<MerchantApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<MerchantApplication> findByStatus(MerchantStatus status, Pageable pageable);

    Optional<MerchantApplication> findByUserIdAndStatus(Long userId, MerchantStatus status);
}
