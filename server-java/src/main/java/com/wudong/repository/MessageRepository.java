package com.wudong.repository;

import com.wudong.entity.Message;
import com.wudong.common.enums.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Message> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, MessageType type, Pageable pageable);

    Page<Message> findByUserIdAndReadOrderByCreatedAtDesc(Long userId, Boolean read, Pageable pageable);

    Page<Message> findByUserIdAndTypeAndReadOrderByCreatedAtDesc(Long userId, MessageType type, Boolean read, Pageable pageable);

    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.userId = :userId AND m.read = false")
    int markAllAsRead(@Param("userId") Long userId);
}
