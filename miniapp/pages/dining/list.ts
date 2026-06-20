import { get } from "../../services/request";

Page({
  data: {
    restaurants: [] as any[],
    page: 1,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadData(true);
    }
  },

  async loadData(append = false) {
    this.setData({ loading: true });
    try {
      const res: any = await get("/restaurant/list", {
        page: this.data.page,
        pageSize: 20,
      });
      this.setData({
        restaurants: append
          ? [...this.data.restaurants, ...res.list]
          : res.list,
        hasMore: res.list.length >= 20,
      });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onRestaurantTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/dining/detail?id=${id}` });
  },
});
