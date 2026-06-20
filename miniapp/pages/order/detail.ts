import { getOrderDetail, cancelOrder } from "../../services/order";
import {
  showLoading,
  hideLoading,
  showToast,
  showConfirm,
} from "../../utils/util";

Page({
  data: {
    order: null as any,
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadOrder(options.id);
    }
  },

  async loadOrder(id: string) {
    showLoading();
    try {
      const order = await getOrderDetail(Number(id));
      this.setData({ order });
    } catch (err) {
      showToast("加载失败");
    } finally {
      hideLoading();
    }
  },

  async onCancel() {
    const confirmed = await showConfirm("确定取消该订单？");
    if (!confirmed) return;

    showLoading();
    try {
      await cancelOrder(this.data.order.id, "用户主动取消");
      showToast("订单已取消", "success");
      this.loadOrder(this.data.order.id);
    } catch (err) {
      // handled
    } finally {
      hideLoading();
    }
  },

  onPay() {
    // TODO: 调用微信支付
    showToast("支付功能开发中");
  },
});
