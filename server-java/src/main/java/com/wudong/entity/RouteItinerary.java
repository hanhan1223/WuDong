package com.wudong.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "route_itineraries")
public class RouteItinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routeId", nullable = false)
    private TravelRoute route;

    @Column(nullable = false)
    private Integer day;

    @Column(columnDefinition = "text")
    private String description;

    @Lob
    @Column(columnDefinition = "json")
    private String scenicSpots;

    @Column(length = 200)
    private String meals;

    @Column(length = 200)
    private String accommodation;

    @Column(length = 200)
    private String transport;
}
