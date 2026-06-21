package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transport_guides")
public class TransportGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 100)
    private String departure;

    @Column(length = 100)
    private String destination;

    @Column(length = 50)
    private String transportType;

    @Column(length = 50)
    private String duration;

    @Column(length = 100)
    private String cost;

    @Column(columnDefinition = "text")
    private String detail;

    @Lob
    @Column(columnDefinition = "json")
    private String images;

    @Column(nullable = false)
    private Integer sort = 0;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;
}
