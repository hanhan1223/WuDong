package com.wudong.entity;

import com.wudong.common.enums.ETicketStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "e_tickets", indexes = {
    @Index(name = "idx_etickets_order", columnList = "orderId")
})
public class ETicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(unique = true, nullable = false, length = 50)
    private String ticketCode;

    @Column(length = 500)
    private String qrCode;

    @Column(nullable = false)
    private Long targetId;

    @Column(nullable = false, length = 20)
    private String targetType;

    @Column(nullable = false)
    private LocalDate validDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ETicketStatus status = ETicketStatus.UNUSED;

    private LocalDateTime usedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
