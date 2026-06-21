package com.wudong.repository;

import com.wudong.entity.RouteItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteItineraryRepository extends JpaRepository<RouteItinerary, Long> {

    List<RouteItinerary> findByRouteIdOrderByDayAsc(Long routeId);
}
