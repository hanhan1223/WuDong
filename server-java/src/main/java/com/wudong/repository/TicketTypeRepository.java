package com.wudong.repository;

import com.wudong.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {

    List<TicketType> findBySpotIdAndStatusTrue(Long spotId);

    @Modifying
    @Query("UPDATE TicketType t SET t.stock = t.stock - :qty WHERE t.id = :id AND t.stock >= :qty")
    int decrementStock(@Param("id") Long id, @Param("qty") Integer qty);
}
