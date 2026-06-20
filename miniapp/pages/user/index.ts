const app = getApp();

Page({
  data: {
    userInfo: null as any,
    isLoggedIn: false,
    orderTabs: [
      { key: "all", name: "全部", icon: "📋" },
      { key: "PENDING_PAYMENT", name: "待支付", icon: "💳" },
      { key: "PAID", name: "待确认", icon: "⏳" },
      { key: "IN_PROGRESS", name: "进行中", icon: "🚀" },
      { key: "COMPLETED", name: "已完成", icon: "✅" },
    ],
    menuItems: [
      { id: 1, name: "我的收藏", icon: "❤️", path: "/pages/favorite/index" },
      { id: 2, name: "收货地址", icon: "📍", path: "/pages/address/index" },
      { id: 3, name: "消息通知", icon: "🔔", path: "/pages/message/index" },
      { id: 4, name: "帮助反馈", icon: "💬", path: "/pages/feedback/index" },
      { id: 5, name: "设置", icon: "⚙️", path: "/pages/setting/index" },
    ],
  },

  onShow() {
    this.checkLogin();
  },

  checkLogin() {
    const isLoggedIn = app.isLoggedIn();
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({ isLoggedIn, userInfo });
  },

  /** 点击头像区域 */
  onAvatarTap() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/login/index" });
    }
  },

  /** 点击订单tab */
  onOrderTabTap(e: any) {
    const key = e.currentTarget.dataset.key;
    wx.navigateTo({ url: `/pages/order/list?status=${key}` });
  },

  /** 点击菜单项 */
  onMenuTap(e: any) {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({ url: path });
  },

  /** 退出登录 */
  onLogout() {
    wx.showModal({
      title: "提示",
      content: "确定退出登录？",
      success: (res) => {
        if (res.confirm) {
          app.clearAuth();
          this.setData({ isLoggedIn: false, userInfo: null });
          wx.showToast({ title: "已退出", icon: "success" });
        }
      },
    });
  },
});
