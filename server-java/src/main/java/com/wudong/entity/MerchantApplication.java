package com.wudong.entity;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.MerchantStatus;
import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "merchant_applications")
public class MerchantApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String shopName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MerchantModule module;

    @Column(length = 50)
    private String contactName;

    @Column(length = 20)
    private String contactPhone;

    @Column(length = 50)
    private String licenseNo;

    @Column(length = 500)
    private String licenseImage;

    @Column(length = 500)
    private String idCardImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MerchantStatus status = MerchantStatus.PENDING;

    @Column(length = 500)
    private String rejectReason;

    private Long reviewerId;

    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
