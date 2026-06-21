package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "follows", uniqueConstraints = {
    @UniqueConstraint(name = "uk_follow", columnNames = {"followerId", "followingId"})
})
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followerId", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followingId", nullable = false)
    private User following;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
