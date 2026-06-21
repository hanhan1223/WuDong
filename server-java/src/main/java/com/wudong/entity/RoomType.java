package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "room_types")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homestayId", nullable = false)
    private Homestay homestay;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String bedType;

    private Integer area;

    @Column(nullable = false)
    private Integer maxGuests = 2;

    @Lob
    @Column(columnDefinition = "json")
    private String facilities;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(length = 500)
    private String mainImage;

    @Lob
    @Column(columnDefinition = "json")
    private String images;

    @Column(nullable = false)
    private Boolean status = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL)
    private List<RoomCalendar> calendars = new ArrayList<>();
}
