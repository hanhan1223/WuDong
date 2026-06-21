package com.wudong.repository;

import com.wudong.entity.Comment;
import com.wudong.common.enums.CommentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByPostIdAndParentIdNullAndStatusOrderByCreatedAtDesc(Long postId, CommentStatus status, Pageable pageable);

    List<Comment> findByParentIdAndStatusOrderByCreatedAtAsc(Long parentId, CommentStatus status);

    long countByPostIdAndStatus(Long postId, CommentStatus status);

    @Modifying
    @Query("UPDATE Comment c SET c.likeCount = c.likeCount + :delta WHERE c.id = :id")
    int updateLikeCount(@Param("id") Long id, @Param("delta") int delta);
}
