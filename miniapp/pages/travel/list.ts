import { get } from "../../services/request";

Page({
  data: {
    tab: "ticket" as "ticket" | "route",
    tickets: [] as any[],
    routes: [] as any[],
    loading: false,
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const [tickets, routes] = await Promise.all([
        get<any[]>("/ticket/list").catch(() => []),
        get<any[]>("/route/list").catch(() => []),
      ]);
      this.setData({ tickets, routes });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onTabChange(e: any) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  onTicketTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/travel/detail?type=ticket&id=${id}` });
  },

  onRouteTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/travel/detail?type=route&id=${id}` });
  },
});
