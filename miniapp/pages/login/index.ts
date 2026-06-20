import { login, register } from "../../services/user";

const app = getApp();

Page({
  data: {
    mode: "login" as "login" | "register",
    phone: "",
    password: "",
    nickname: "",
    loading: false,
  },

  /** 切换登录/注册 */
  switchMode() {
    this.setData({
      mode: this.data.mode === "login" ? "register" : "login",
    });
  },

  /** 输入手机号 */
  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },

  /** 输入密码 */
  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },

  /** 输入昵称 */
  onNicknameInput(e: any) {
    this.setData({ nickname: e.detail.value });
  },

  /** 提交 */
  async onSubmit() {
    const { mode, phone, password, nickname } = this.data;

    if (!phone || phone.length !== 11) {
      wx.showToast({ title: "请输入正确的手机号", icon: "none" });
      return;
    }
    if (!password || password.length < 8) {
      wx.showToast({ title: "密码至少8位", icon: "none" });
      return;
    }
    if (mode === "register" && !nickname) {
      wx.showToast({ title: "请输入昵称", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    try {
      let res: any;
      if (mode === "login") {
        res = await login({ phone, password });
      } else {
        res = await register({ phone, password, nickname });
      }

      app.setToken(res.token);
      wx.setStorageSync("userInfo", res.user);
      wx.showToast({
        title: mode === "login" ? "登录成功" : "注册成功",
        icon: "success",
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      // handled by request interceptor
    } finally {
      this.setData({ loading: false });
    }
  },
});
