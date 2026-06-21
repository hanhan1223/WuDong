package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.community.CreateCommentRequest;
import com.wudong.dto.community.CreatePostRequest;
import com.wudong.entity.Comment;
import com.wudong.entity.Post;
import com.wudong.entity.Topic;
import com.wudong.security.SecurityUtils;
import com.wudong.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "社区")
@RestController
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @Operation(summary = "获取帖子列表")
    @GetMapping("/api/posts")
    public ApiResponse<Page<Post>> getPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String topicId,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(communityService.getPosts(keyword, topicId, userId, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取帖子详情")
    @GetMapping("/api/posts/{id}")
    public ApiResponse<Post> getPost(@PathVariable Long id) {
        return ApiResponse.success(communityService.getPostById(id));
    }

    @Operation(summary = "创建帖子")
    @PostMapping("/api/posts")
    public ApiResponse<Post> createPost(@Valid @RequestBody CreatePostRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Post post = communityService.createPost(userId, request.getTitle(), request.getContent(),
                request.getImages(), request.getVideoUrl(), request.getLocationId(),
                request.getLocationType(), request.getLocationName(), request.getTopicIds());
        return ApiResponse.success(post, "发布成功");
    }

    @Operation(summary = "编辑帖子")
    @PutMapping("/api/posts/{id}")
    public ApiResponse<Post> updatePost(@PathVariable Long id, @Valid @RequestBody CreatePostRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Post post = communityService.updatePost(id, userId, request.getTitle(), request.getContent(),
                request.getImages(), request.getVideoUrl());
        return ApiResponse.success(post, "更新成功");
    }

    @Operation(summary = "删除帖子")
    @DeleteMapping("/api/posts/{id}")
    public ApiResponse<Void> deletePost(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        communityService.deletePost(id, userId);
        return ApiResponse.success(null, "删除成功");
    }

    @Operation(summary = "点赞/取消点赞帖子")
    @PostMapping("/api/posts/{id}/like")
    public ApiResponse<Boolean> toggleLikePost(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean liked = communityService.toggleLikePost(id, userId);
        return ApiResponse.success(liked);
    }

    @Operation(summary = "获取评论列表")
    @GetMapping("/api/posts/{id}/comments")
    public ApiResponse<Page<Comment>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(communityService.getComments(id, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "创建评论")
    @PostMapping("/api/posts/{id}/comments")
    public ApiResponse<Comment> createComment(@PathVariable Long id, @Valid @RequestBody CreateCommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Comment comment = communityService.createComment(id, userId, request.getContent(),
                request.getParentId(), request.getReplyToUserId());
        return ApiResponse.success(comment, "评论成功");
    }

    @Operation(summary = "点赞/取消点赞评论")
    @PostMapping("/api/comments/{id}/like")
    public ApiResponse<Boolean> toggleLikeComment(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean liked = communityService.toggleLikeComment(id, userId);
        return ApiResponse.success(liked);
    }

    @Operation(summary = "获取话题列表")
    @GetMapping("/api/topics")
    public ApiResponse<Page<Topic>> getTopics(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(communityService.getTopics(PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "关注/取消关注用户")
    @PostMapping("/api/users/{id}/follow")
    public ApiResponse<Boolean> toggleFollow(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean followed = communityService.toggleFollow(userId, id);
        return ApiResponse.success(followed);
    }
}
