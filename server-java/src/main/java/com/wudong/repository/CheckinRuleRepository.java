package com.wudong.repository;

import com.wudong.entity.CheckinRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CheckinRuleRepository extends JpaRepository<CheckinRule, Long> {

    Optional<CheckinRule> findByHomestayId(Long homestayId);
}
