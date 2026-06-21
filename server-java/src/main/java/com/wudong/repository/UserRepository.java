package com.wudong.repository;

import com.wudong.entity.User;
import com.wudong.common.enums.UserRole;
import com.wudong.common.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    Page<User> findByNicknameContainingOrPhoneContaining(String nickname, String phone, Pageable pageable);

    long countByStatus(UserStatus status);

    long countByRole(UserRole role);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT u FROM User u WHERE u.status = 'MUTED' AND u.updatedAt < :threshold")
    java.util.List<User> findMutedUsersBefore(@Param("threshold") LocalDateTime threshold);
}
