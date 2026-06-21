package com.wudong.repository;

import com.wudong.entity.ETicket;
import com.wudong.common.enums.ETicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ETicketRepository extends JpaRepository<ETicket, Long> {

    Optional<ETicket> findByTicketCode(String ticketCode);

    List<ETicket> findByOrderId(Long orderId);

    @Query("SELECT et FROM ETicket et WHERE et.status = 'UNUSED' AND et.validDate < :date")
    List<ETicket> findExpiredTickets(@Param("date") LocalDate date);
}
