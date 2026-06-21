package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "search_history", indexes = {
    @Index(name = "idx_search_user_created", columnList = "userId, createdAt")
})
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String keyword;

    @Column(length = 50)
    private String module;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
