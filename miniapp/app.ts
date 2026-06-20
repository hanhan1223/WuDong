// 环境配置：开发环境用 localhost，生产环境替换为正式域名
const BASE_URL_MAP: Record<string, string> = {
  develop: "http://localhost:7001/api",
  trial: "https://api-trial.wudong-tourism.com/api",
  release: "https://api.wudong-tourism.com/api",
};

App({
  globalData: {
    baseUrl: BASE_URL_MAP["develop"], // 默认开发环境，onLaunch 中会根据版本覆盖
    token: "",
    userInfo: null as any,
  },

  onLaunch() {
    // 根据小程序版本设置 baseUrl
    const accountInfo = wx.getAccountInfoSync();
    const envVersion = accountInfo.miniProgram.envVersion || "develop";
    this.globalData.baseUrl =
      BASE_URL_MAP[envVersion] || BASE_URL_MAP["develop"];

    // 检查登录状态
    const token = wx.getStorageSync("token");
    if (token) {
      this.globalData.token = token;
    }
  },

  onShow() {
    // 小程序从后台进入前台
  },

  /** 设置 Token */
  setToken(token: string) {
    this.globalData.token = token;
    wx.setStorageSync("token", token);
  },

  /** 清除登录状态 */
  clearAuth() {
    this.globalData.token = "";
    this.globalData.userInfo = null;
    wx.removeStorageSync("token");
    wx.removeStorageSync("userInfo");
  },

  /** 检查是否已登录 */
  isLoggedIn(): boolean {
    return !!this.globalData.token;
  },
});
