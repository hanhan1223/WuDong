package com.wudong.service.impl;

import com.wudong.common.enums.*;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.CommunityService;
import com.wudong.service.ModerationService;
import com.wudong.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 社区服务实现
 */
@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final TopicRepository topicRepository;
    private final FollowRepository followRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final ModerationService moderationService;
    private final MessageService messageService;

    /**
     * 获取帖子列表
     */
    @Override
    public Page<Post> getPosts(String keyword, String topicId, Long userId, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return postRepository.searchByKeyword(keyword, pageable);
        }
        if (topicId != null) {
            return postRepository.findByTopicId(topicId, pageable);
        }
        if (userId != null) {
            return postRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, PostStatus.NORMAL, pageable);
        }
        return postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.NORMAL, pageable);
    }

    /**
     * 获取帖子详情
     */
    @Override
    @Transactional
    public Post getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException("帖子不存在", 404));

        if (post.getStatus() != PostStatus.NORMAL) {
            throw new BusinessException("帖子不可见");
        }

        // 原子增加浏览量
        postRepository.incrementViewCount(id);
        post.setViewCount(post.getViewCount() + 1);

        return post;
    }

    /**
     * 创建帖子
     */
    @Override
    @Transactional
    public Post createPost(Long userId, String title, String content, List<String> images, String videoUrl,
                            Long locationId, String locationType, String locationName, List<Long> topicIds) {
        // 内容审核
        boolean approved = moderationService.moderateContent(title + " " + content);
        if (!approved) {
            throw new BusinessException("内容包含敏感信息，无法发布");
        }

        Post post = new Post();
        post.setUser(new User());
        post.getUser().setId(userId);
        post.setTitle(title);
        post.setContent(content);
        post.setImages(images != null ? String.join(",", images) : null);
        post.setVideoUrl(videoUrl);
        post.setLocationId(locationId);
        post.setLocationType(locationType);
        post.setLocationName(locationName);
        post.setTopicIds(topicIds != null ? topicIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(",")) : null);
        post.setStatus(PostStatus.UNDER_REVIEW);

        return postRepository.save(post);
    }

    /**
     * 编辑帖子
     */
    @Override
    @Transactional
    public Post updatePost(Long postId, Long userId, String title, String content, List<String> images, String videoUrl) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException("帖子不存在", 404));

        if (!post.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此帖子", 403);
        }

        // 内容审核
        boolean approved = moderationService.moderateContent(title + " " + content);
        if (!approved) {
            throw new BusinessException("内容包含敏感信息，无法发布");
        }

        if (title != null) post.setTitle(title);
        if (content != null) post.setContent(content);
        if (images != null) post.setImages(String.join(",", images));
        if (videoUrl != null) post.setVideoUrl(videoUrl);
        post.setStatus(PostStatus.UNDER_REVIEW); // 重新进入审核

        return postRepository.save(post);
    }

    /**
     * 删除帖子
     */
    @Override
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException("帖子不存在", 404));

        if (!post.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此帖子", 403);
        }

        postRepository.delete(post);
    }

    /**
     * 点赞/取消点赞帖子
     */
    @Override
    @Transactional
    public boolean toggleLikePost(Long postId, Long userId) {
        return toggleLike(userId, LikeTargetType.POST, postId);
    }

    /**
     * 点赞/取消点赞评论
     */
    @Override
    @Transactional
    public boolean toggleLikeComment(Long commentId, Long userId) {
        return toggleLike(userId, LikeTargetType.COMMENT, commentId);
    }

    private boolean toggleLike(Long userId, LikeTargetType targetType, Long targetId) {
        // 先尝试原子删除（利用 unique constraint 保证幂等）
        int deleted = likeRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);

        if (deleted > 0) {
            // 取消点赞成功，原子减少点赞数
            if (targetType == LikeTargetType.POST) {
                postRepository.updateLikeCount(targetId, -1);
            } else if (targetType == LikeTargetType.COMMENT) {
                commentRepository.updateLikeCount(targetId, -1);
            }
            return false; // 取消点赞
        }

        // 不存在点赞记录，尝试新增
        Like like = new Like();
        like.setUser(new User());
        like.getUser().setId(userId);
        like.setTargetType(targetType);
        like.setTargetId(targetId);

        try {
            likeRepository.saveAndFlush(like);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 并发场景下另一线程已插入，视为已点赞
            return true;
        }

        // 原子增加点赞数
        if (targetType == LikeTargetType.POST) {
            postRepository.updateLikeCount(targetId, 1);
        } else if (targetType == LikeTargetType.COMMENT) {
            commentRepository.updateLikeCount(targetId, 1);
        }
        return true; // 点赞
    }

    /**
     * 获取评论列表（分层，顶级评论 + 5条子评论）
     */
    @Override
    public Page<Comment> getComments(Long postId, Pageable pageable) {
        return commentRepository.findByPostIdAndParentIdNullAndStatusOrderByCreatedAtDesc(postId, CommentStatus.NORMAL, pageable);
    }

    /**
     * 获取子评论
     */
    @Override
    public List<Comment> getChildComments(Long parentId) {
        return commentRepository.findByParentIdAndStatusOrderByCreatedAtAsc(parentId, CommentStatus.NORMAL);
    }

    /**
     * 创建评论
     */
    @Override
    @Transactional
    public Comment createComment(Long postId, Long userId, String content, Long parentId, Long replyToUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException("帖子不存在", 404));

        // 内容审核
        boolean approved = moderationService.moderateContent(content);
        if (!approved) {
            throw new BusinessException("评论包含敏感信息，无法发布");
        }

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(new User());
        comment.getUser().setId(userId);
        comment.setContent(content);
        comment.setParentId(parentId);
        comment.setReplyToUserId(replyToUserId);
        comment.setStatus(CommentStatus.NORMAL);

        comment = commentRepository.save(comment);

        // 原子增加帖子评论数
        postRepository.incrementCommentCount(postId);

        return comment;
    }

    /**
     * 获取话题列表
     */
    @Override
    public Page<Topic> getTopics(Pageable pageable) {
        return topicRepository.findByStatusTrueOrderByTopDescFollowCountDesc(pageable);
    }

    /**
     * 关注/取消关注用户
     */
    @Override
    @Transactional
    public boolean toggleFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new BusinessException("不能关注自己");
        }

        // 先尝试查找并删除（原子性由数据库 unique constraint 保证幂等）
        Follow existingFollow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId).orElse(null);

        if (existingFollow != null) {
            followRepository.delete(existingFollow);
            return false; // 取消关注
        }

        // 不存在关注记录，尝试新增
        Follow follow = new Follow();
        follow.setFollower(new User());
        follow.getFollower().setId(followerId);
        follow.setFollowing(new User());
        follow.getFollowing().setId(followingId);

        try {
            followRepository.saveAndFlush(follow);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 并发场景下另一线程已插入，视为已关注
            return true;
        }
        return true; // 关注
    }
}
