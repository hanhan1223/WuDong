package com.wudong.entity;

import com.wudong.common.enums.RoomCalendarStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "room_calendars", uniqueConstraints = {
    @UniqueConstraint(name = "uk_room_date", columnNames = {"roomTypeId", "date"})
})
public class RoomCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomTypeId", nullable = false)
    private RoomType roomType;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer available = 0;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomCalendarStatus status = RoomCalendarStatus.AVAILABLE;

    @Column(updatable = false)
    private LocalDateTime createdAt;
}
