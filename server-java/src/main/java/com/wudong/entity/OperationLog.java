package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "operation_logs", indexes = {
    @Index(name = "idx_oplogs_operator_created", columnList = "operatorId, createdAt")
})
public class OperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operatorId", nullable = false)
    private AdminUser operator;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 200)
    private String target;

    @Column(columnDefinition = "text")
    private String content;

    @Column(length = 50)
    private String ip;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
