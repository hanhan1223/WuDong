import { getOrderList } from "../../services/order";

Page({
  data: {
    tabs: [
      { key: "all", name: "全部" },
      { key: "PENDING_PAYMENT", name: "待支付" },
      { key: "PAID", name: "待确认" },
      { key: "IN_PROGRESS", name: "进行中" },
      { key: "COMPLETED", name: "已完成" },
    ],
    currentTab: "all",
    orders: [] as any[],
    page: 1,
    loading: false,
    hasMore: true,
  },

  onLoad(options: any) {
    if (options.status && options.status !== "all") {
      this.setData({ currentTab: options.status });
    }
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadOrders().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadOrders(true);
    }
  },

  onTabChange(e: any) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab,
      page: 1,
      hasMore: true,
    });
    this.loadOrders();
  },

  async loadOrders(append = false) {
    this.setData({ loading: true });
    try {
      const params: any = { page: this.data.page, pageSize: 20 };
      if (this.data.currentTab !== "all") {
        params.status = this.data.currentTab;
      }
      const res = await getOrderList(params);
      this.setData({
        orders: append ? [...this.data.orders, ...res.list] : res.list,
        hasMore: res.list.length >= 20,
      });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onOrderTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order/detail?id=${id}` });
  },
});
