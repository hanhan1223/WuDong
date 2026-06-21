package com.wudong.entity;

import com.wudong.common.enums.FinanceStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "finance_records", indexes = {
    @Index(name = "idx_finance_merchant_status", columnList = "merchantId, status")
})
public class FinanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchantId", nullable = false)
    private Merchant merchant;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal orderAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal commission;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal merchantIncome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FinanceStatus status = FinanceStatus.PENDING;

    private LocalDateTime settledAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
