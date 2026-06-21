package com.wudong.entity;

import com.wudong.common.enums.HomestayStatus;
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
@Table(name = "homestays")
public class Homestay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchantId", nullable = false)
    private Merchant merchant;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String address;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Lob
    @Column(columnDefinition = "json")
    private String styleTags;

    @Lob
    @Column(columnDefinition = "json")
    private String facilityTags;

    @Column(length = 500)
    private String mainImage;

    @Column(columnDefinition = "text")
    private String introduction;

    @Column(nullable = false, precision = 3, scale = 1)
    private java.math.BigDecimal rating = new java.math.BigDecimal("5.0");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HomestayStatus status = HomestayStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "homestay", cascade = CascadeType.ALL)
    private List<RoomType> roomTypes = new ArrayList<>();

    @OneToOne(mappedBy = "homestay", cascade = CascadeType.ALL)
    private CheckinRule checkinRule;
}
