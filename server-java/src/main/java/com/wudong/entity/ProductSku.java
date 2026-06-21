package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "product_skus")
public class ProductSku {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productId", nullable = false)
    private Product product;

    @Column(nullable = false, length = 200)
    private String specName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(length = 500)
    private String image;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
