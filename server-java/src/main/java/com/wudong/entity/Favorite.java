package com.wudong.entity;

import com.wudong.common.enums.FavoriteTargetType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "favorites", uniqueConstraints = {
    @UniqueConstraint(name = "uk_favorite", columnNames = {"userId", "targetType", "targetId"})
})
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FavoriteTargetType targetType;

    @Column(nullable = false)
    private Long targetId;

    @Column(updatable = false)
    private LocalDateTime createdAt;
}
