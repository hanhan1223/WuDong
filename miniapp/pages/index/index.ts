import { get } from "../../services/request";

Page({
  data: {
    banners: [] as any[],
    categories: [
      {
        id: 1,
        name: "衣",
        icon: "/assets/icons/clothing.png",
        path: "/pages/clothing/list",
      },
      {
        id: 2,
        name: "食",
        icon: "/assets/icons/dining.png",
        path: "/pages/dining/list",
      },
      {
        id: 3,
        name: "住",
        icon: "/assets/icons/homestay.png",
        path: "/pages/homestay/list",
      },
      {
        id: 4,
        name: "行",
        icon: "/assets/icons/travel.png",
        path: "/pages/travel/list",
      },
      {
        id: 5,
        name: "社区",
        icon: "/assets/icons/community.png",
        path: "/pages/community/index",
      },
    ],
    recommendations: [] as any[],
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
      const [banners, recommendations] = await Promise.all([
        get<any[]>("/banners").catch(() => []),
        get<any[]>("/recommendations").catch(() => []),
      ]);
      this.setData({ banners, recommendations });
    } catch (err) {
      // ignore
    } finally {
      this.setData({ loading: false });
    }
  },

  /** 点击金刚区入口 */
  onCategoryTap(e: any) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({ url: path });
  },

  /** 点击轮播图 */
  onBannerTap(e: any) {
    const banner = this.data.banners[e.detail.current];
    if (banner?.linkUrl) {
      wx.navigateTo({ url: banner.linkUrl });
    }
  },

  /** 点击推荐项 */
  onRecommendTap(e: any) {
    const item = e.currentTarget.dataset.item;
    if (item?.linkUrl) {
      wx.navigateTo({ url: item.linkUrl });
    }
  },

  /** 搜索 */
  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/index" });
  },
});
