package com.wudong.repository;

import com.wudong.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserIdOrderByDefaultedDescCreatedAtDesc(Long userId);

    Optional<Address> findByUserIdAndDefaulted(Long userId, Boolean defaulted);

    long countByUserId(Long userId);
}
