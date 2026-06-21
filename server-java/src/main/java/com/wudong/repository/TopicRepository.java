package com.wudong.repository;

import com.wudong.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findByStatusTrueOrderByIsTopDescFollowCountDesc();

    Page<Topic> findByStatusTrueOrderByIsTopDescFollowCountDesc(Pageable pageable);

    List<Topic> findByIsRecommendTrueAndStatusTrue();
}
