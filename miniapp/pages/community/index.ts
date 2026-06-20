import { getPosts } from "../../services/community";

Page({
  data: {
    posts: [] as any[],
    sort: "recommend" as "recommend" | "latest",
    page: 1,
    total: 0,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.loadPosts();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadPosts().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadPosts(true);
    }
  },

  async loadPosts(append = false) {
    this.setData({ loading: true });
    try {
      const res = await getPosts({
        sort: this.data.sort,
        page: this.data.page,
        pageSize: 20,
      });
      this.setData({
        posts: append ? [...this.data.posts, ...res.list] : res.list,
        total: res.total,
        hasMore: this.data.posts.length < res.total,
      });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  /** 切换排序 */
  onSortChange(e: any) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({ sort, page: 1, hasMore: true });
    this.loadPosts();
  },

  /** 点击游记 */
  onPostTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community/detail?id=${id}` });
  },

  /** 发布游记 */
  onPublish() {
    wx.navigateTo({ url: "/pages/community/publish" });
  },
});
