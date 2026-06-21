package com.wudong.repository;

import com.wudong.entity.RoomCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomCalendarRepository extends JpaRepository<RoomCalendar, Long> {

    List<RoomCalendar> findByRoomTypeIdAndDateBetween(Long roomTypeId, LocalDate startDate, LocalDate endDate);

    @Modifying
    @Query("UPDATE RoomCalendar rc SET rc.available = rc.available - 1 WHERE rc.roomType.id = :roomTypeId AND rc.date = :date AND rc.available > 0")
    int decrementAvailable(@Param("roomTypeId") Long roomTypeId, @Param("date") LocalDate date);
}
