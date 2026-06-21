package com.wudong.entity;

import com.wudong.common.enums.ContentType;
import com.wudong.common.enums.TargetType;
import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_reviews_target", columnList = "targetType, targetId")
})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TargetType targetType;

    @Column(nullable = false)
    private Long targetId;

    private Long orderId;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "text")
    private String content;

    @Lob
    @Column(columnDefinition = "json")
    private String images;

    @Column(columnDefinition = "text")
    private String appendContent;

    private LocalDateTime appendTime;

    @Column(columnDefinition = "text")
    private String replyContent;

    private LocalDateTime replyTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentType status = ContentType.NORMAL;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
