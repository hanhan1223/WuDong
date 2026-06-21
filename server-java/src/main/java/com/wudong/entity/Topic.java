package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String coverImage;

    @Column(nullable = false)
    private Integer followCount = 0;

    @Column(nullable = false)
    private Integer postCount = 0;

    @Column(name = "is_top", nullable = false)
    private Boolean top = false;

    @Column(name = "is_recommend", nullable = false)
    private Boolean recommend = false;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;
}
