package com.wudong.service;

import com.wudong.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 社区服务 - 等价于 Node.js 版本的 CommunityService
 */
public interface CommunityService {

    /**
     * 获取帖子列表
     */
    Page<Post> getPosts(String keyword, String topicId, Long userId, Pageable pageable);

    /**
     * 获取帖子详情
     */
    Post getPostById(Long id);

    /**
     * 创建帖子
     */
    Post createPost(Long userId, String title, String content, List<String> images, String videoUrl,
                    Long locationId, String locationType, String locationName, List<Long> topicIds);

    /**
     * 编辑帖子
     */
    Post updatePost(Long postId, Long userId, String title, String content, List<String> images, String videoUrl);

    /**
     * 删除帖子
     */
    void deletePost(Long postId, Long userId);

    /**
     * 点赞/取消点赞帖子
     */
    boolean toggleLikePost(Long postId, Long userId);

    /**
     * 点赞/取消点赞评论
     */
    boolean toggleLikeComment(Long commentId, Long userId);

    /**
     * 获取评论列表（分层，顶级评论 + 5条子评论）
     */
    Page<Comment> getComments(Long postId, Pageable pageable);

    /**
     * 获取子评论
     */
    List<Comment> getChildComments(Long parentId);

    /**
     * 创建评论
     */
    Comment createComment(Long postId, Long userId, String content, Long parentId, Long replyToUserId);

    /**
     * 获取话题列表
     */
    Page<Topic> getTopics(Pageable pageable);

    /**
     * 关注/取消关注用户
     */
    boolean toggleFollow(Long followerId, Long followingId);
}
