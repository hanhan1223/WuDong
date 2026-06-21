package com.wudong.entity;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.MerchantStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "merchants")
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", unique = true, nullable = false)
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

    private LocalDateTime settledAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL)
    private java.util.List<Restaurant> restaurants = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL)
    private java.util.List<Homestay> homestays = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL)
    private java.util.List<Product> products = new java.util.ArrayList<>();
}
