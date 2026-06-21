package com.wudong.repository;

import com.wudong.entity.Merchant;
import com.wudong.common.enums.MerchantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {

    Optional<Merchant> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Page<Merchant> findByStatus(MerchantStatus status, Pageable pageable);

    long countByStatus(MerchantStatus status);
}
