import { get } from "../../services/request";

Page({
  data: {
    messages: [] as any[],
    loading: false,
    page: 1,
    hasMore: true,
  },

  onLoad() {
    this.loadMessages();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadMessages().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadMessages(true);
    }
  },

  async loadMessages(append = false) {
    this.setData({ loading: true });
    try {
      const res: any = await get("/messages", {
        page: this.data.page,
        pageSize: 20,
      });
      this.setData({
        messages: append ? [...this.data.messages, ...res.list] : res.list,
        hasMore: res.list.length >= 20,
      });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onMessageTap(e: any) {
    const msg = e.currentTarget.dataset.item;
    if (msg.linkUrl) {
      wx.navigateTo({ url: msg.linkUrl });
    }
  },
});
