package com.wudong.repository;

import com.wudong.entity.TransportGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportGuideRepository extends JpaRepository<TransportGuide, Long> {

    List<TransportGuide> findByStatusTrueOrderBySortAsc();
}
