import { get } from "../../services/request";

Page({
  data: {
    homestays: [] as any[],
    page: 1,
    loading: false,
    hasMore: true,
    checkIn: "",
    checkOut: "",
    guests: 2,
  },

  onLoad() {
    this.initDates();
    this.loadData();
  },

  initDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    this.setData({ checkIn: fmt(today), checkOut: fmt(tomorrow) });
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
      const res: any = await get("/homestay/list", {
        checkIn: this.data.checkIn,
        checkOut: this.data.checkOut,
        guests: this.data.guests,
        page: this.data.page,
        pageSize: 20,
      });
      this.setData({
        homestays: append ? [...this.data.homestays, ...res.list] : res.list,
        hasMore: res.list.length >= 20,
      });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onCheckInChange(e: any) {
    this.setData({ checkIn: e.detail.value });
  },

  onCheckOutChange(e: any) {
    this.setData({ checkOut: e.detail.value });
  },

  onHomestayTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/homestay/detail?id=${id}&checkIn=${this.data.checkIn}&checkOut=${this.data.checkOut}`,
    });
  },
});
