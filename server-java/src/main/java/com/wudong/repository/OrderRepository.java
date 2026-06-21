package com.wudong.repository;

import com.wudong.entity.Order;
import com.wudong.common.enums.OrderStatus;
import com.wudong.common.enums.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNo(String orderNo);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);

    Page<Order> findByUserIdAndOrderTypeOrderByCreatedAtDesc(Long userId, OrderType orderType, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Page<Order> findByOrderType(OrderType orderType, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long count();

    long countByStatus(OrderStatus status);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT COALESCE(SUM(o.payAmount), 0.00) FROM Order o WHERE o.createdAt > :dateTime AND o.status != 'CANCELLED'")
    java.math.BigDecimal sumPayAmountAfter(@Param("dateTime") LocalDateTime dateTime);

    @Query("SELECT o FROM Order o WHERE o.status = 'CONFIRMED' AND o.createdAt < :threshold")
    List<Order> findConfirmedOrdersBefore(@Param("threshold") LocalDateTime threshold);
}
