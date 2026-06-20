import {
  getPostDetail,
  toggleLike,
  addComment,
  getComments,
  toggleFollow,
} from "../../services/community";
import { showToast, showLoading, hideLoading } from "../../utils/util";

const app = getApp();

Page({
  data: {
    post: null as any,
    comments: [] as any[],
    commentText: "",
    replyTo: null as any,
    page: 1,
    loading: false,
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadPost(options.id);
      this.loadComments(options.id);
    }
  },

  async loadPost(id: string) {
    showLoading();
    try {
      const post = await getPostDetail(Number(id));
      this.setData({ post });
    } catch (err) {
      showToast("加载失败");
    } finally {
      hideLoading();
    }
  },

  async loadComments(postId: string, append = false) {
    try {
      const res = await getComments(Number(postId), this.data.page);
      this.setData({
        comments: append ? [...this.data.comments, ...res.list] : res.list,
      });
    } catch (err) {
      // ignore
    }
  },

  async onLike() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    try {
      await toggleLike("POST", this.data.post.id);
      const post = { ...this.data.post };
      post.isLiked = !post.isLiked;
      post.likeCount += post.isLiked ? 1 : -1;
      this.setData({ post });
    } catch (err) {
      // handled
    }
  },

  onCommentInput(e: any) {
    this.setData({ commentText: e.detail.value });
  },

  onReplyTap(e: any) {
    const comment = e.currentTarget.dataset.comment;
    this.setData({ replyTo: comment });
  },

  cancelReply() {
    this.setData({ replyTo: null });
  },

  async onSubmitComment() {
    const { commentText, post, replyTo } = this.data;
    if (!commentText.trim()) {
      showToast("请输入评论内容");
      return;
    }

    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }

    try {
      await addComment({
        postId: post.id,
        content: commentText.trim(),
        parentId: replyTo?.id,
        replyToUserId: replyTo?.userId,
      });
      this.setData({ commentText: "", replyTo: null });
      showToast("评论成功", "success");
      this.loadComments(String(post.id));
    } catch (err) {
      // handled
    }
  },

  /** 预览图片 */
  previewImage(e: any) {
    const current = e.currentTarget.dataset.src;
    const urls = this.data.post.images || [];
    wx.previewImage({ current, urls });
  },

  async onFollow() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    try {
      await toggleFollow(this.data.post.user.id);
      const post = { ...this.data.post };
      post.isFollowed = !post.isFollowed;
      this.setData({ post });
      showToast(post.isFollowed ? "已关注" : "已取消关注", "success");
    } catch (err) {
      // handled
    }
  },
});
