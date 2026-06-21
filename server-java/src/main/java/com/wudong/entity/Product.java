package com.wudong.entity;

import com.wudong.common.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_category_status", columnList = "categoryId, status"),
    @Index(name = "idx_products_merchant", columnList = "merchantId")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoryId", nullable = false)
    private ProductCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchantId", nullable = false)
    private Merchant merchant;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String subtitle;

    @Column(nullable = false, length = 500)
    private String mainImage;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal marketPrice;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer sales = 0;

    @Lob
    @Column(columnDefinition = "longtext")
    private String detail;

    @Column(columnDefinition = "text")
    private String craftIntro;

    @Column(length = 100)
    private String artisanId;

    @Column(length = 100)
    private String artisanName;

    @Column(columnDefinition = "text")
    private String artisanStory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.DRAFT;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductSku> skus = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sort ASC")
    private List<ProductImage> images = new ArrayList<>();
}
