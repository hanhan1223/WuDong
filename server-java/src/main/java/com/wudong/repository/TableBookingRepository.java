package com.wudong.repository;

import com.wudong.entity.TableBooking;
import com.wudong.common.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TableBookingRepository extends JpaRepository<TableBooking, Long> {

    Page<TableBooking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COUNT(tb) FROM TableBooking tb WHERE tb.restaurant.id = :restaurantId AND tb.bookingDate = :bookingDate AND tb.timeSlotId = :timeSlotId AND tb.status IN ('PENDING', 'CONFIRMED')")
    long countActiveBookings(@Param("restaurantId") Long restaurantId, @Param("bookingDate") LocalDate bookingDate, @Param("timeSlotId") Long timeSlotId);
}
