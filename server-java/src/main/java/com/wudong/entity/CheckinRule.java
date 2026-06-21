package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "checkin_rules")
public class CheckinRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homestayId", unique = true, nullable = false)
    private Homestay homestay;

    @Column(length = 20)
    private String checkinTime;

    @Column(length = 20)
    private String checkoutTime;

    @Column(length = 200)
    private String petPolicy;

    @Column(nullable = false)
    private Boolean hasBreakfast = false;

    @Column(nullable = false)
    private Long deposit = 0L;

    @Column(length = 500)
    private String notes;
}
