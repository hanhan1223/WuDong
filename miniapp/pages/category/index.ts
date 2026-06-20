Page({
  data: {
    modules: [
      {
        id: "clothing",
        name: "衣 - 非遗商品",
        desc: "苗族银饰、蜡染、刺绣等非遗手工艺品",
        icon: "👘",
        color: "#1F5FA8",
        path: "/pages/clothing/list",
      },
      {
        id: "dining",
        name: "食 - 餐饮美食",
        desc: "苗家特色餐厅、农产品特产",
        icon: "🍲",
        color: "#E85D2F",
        path: "/pages/dining/list",
      },
      {
        id: "homestay",
        name: "住 - 特色民宿",
        desc: "苗寨吊脚楼、特色客栈",
        icon: "🏠",
        color: "#6B8E3D",
        path: "/pages/homestay/list",
      },
      {
        id: "travel",
        name: "行 - 线路订票",
        desc: "景区门票、一日游/两日游路线",
        icon: "🎫",
        color: "#D4A14B",
        path: "/pages/travel/list",
      },
      {
        id: "community",
        name: "社区 - 游记分享",
        desc: "旅行游记、照片、短视频",
        icon: "📸",
        color: "#7A5230",
        path: "/pages/community/index",
      },
    ],
  },

  onModuleTap(e: any) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({ url: path });
  },
});
