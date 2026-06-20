import { get, post } from "../../services/request";
import { showLoading, hideLoading, showToast } from "../../utils/util";

const app = getApp();

Page({
  data: {
    type: "ticket" as "ticket" | "route",
    detail: null as any,
    selectedDate: "",
    quantity: 1,
    guestName: "",
    guestPhone: "",
  },

  onLoad(options: any) {
    this.setData({ type: options.type || "ticket" });
    if (options.id) {
      this.loadDetail(options.id);
    }
    const today = new Date();
    this.setData({
      selectedDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    });
  },

  async loadDetail(id: string) {
    showLoading();
    try {
      const endpoint =
        this.data.type === "ticket" ? `/ticket/${id}` : `/route/${id}`;
      const detail = await get<any>(endpoint);
      this.setData({ detail });
    } catch (err) {
      showToast("加载失败");
    } finally {
      hideLoading();
    }
  },

  onDateChange(e: any) {
    this.setData({ selectedDate: e.detail.value });
  },

  onQuantityChange(e: any) {
    const type = e.currentTarget.dataset.type;
    let q = this.data.quantity;
    if (type === "minus" && q > 1) q--;
    if (type === "plus" && q < 10) q++;
    this.setData({ quantity: q });
  },

  onNameInput(e: any) {
    this.setData({ guestName: e.detail.value });
  },

  onPhoneInput(e: any) {
    this.setData({ guestPhone: e.detail.value });
  },

  async onBook() {
    const { detail, selectedDate, quantity, guestName, guestPhone, type } =
      this.data;
    if (!guestName) {
      showToast("请输入姓名");
      return;
    }
    if (!guestPhone) {
      showToast("请输入手机号");
      return;
    }

    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }

    showLoading();
    try {
      await post("/order/create", {
        orderType: type === "ticket" ? "TICKET" : "ROUTE",
        module: "TRAVEL",
        items: [
          {
            productId: detail.id,
            productName: detail.title || detail.name,
            productImage: detail.mainImage,
            price: detail.price,
            quantity,
          },
        ],
      });
      showToast("下单成功", "success");
      wx.navigateTo({ url: "/pages/order/list" });
    } catch (err) {
      // handled
    } finally {
      hideLoading();
    }
  },
});
