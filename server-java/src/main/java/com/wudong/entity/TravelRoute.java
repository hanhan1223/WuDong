package com.wudong.entity;

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
@Table(name = "travel_routes")
public class TravelRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private Integer days;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Lob
    @Column(columnDefinition = "json")
    private String includedItems;

    @Column(length = 100)
    private String departure;

    @Column(length = 100)
    private String destination;

    @Column(length = 200)
    private String accommodation;

    @Column(length = 200)
    private String meals;

    @Column(length = 500)
    private String notes;

    @Column(length = 500)
    private String mainImage;

    @Lob
    @Column(columnDefinition = "longtext")
    private String detail;

    @Column(length = 200)
    private String themeTags;

    @Column(nullable = false)
    private Boolean status = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL)
    @OrderBy("day ASC")
    private List<RouteItinerary> itineraries = new ArrayList<>();
}
