package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "system_configs")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String key;

    @Column(nullable = false, columnDefinition = "text")
    private String value;

    @Column(length = 500)
    private String remark;

    private LocalDateTime updatedAt;
}
