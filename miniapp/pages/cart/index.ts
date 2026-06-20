import { get, post, del } from "../../services/request";
import { showToast, showConfirm } from "../../utils/util";

const app = getApp();

Page({
  data: {
    items: [] as any[],
    selectedIds: [] as number[],
    totalPrice: 0,
    loading: false,
  },

  onShow() {
    this.loadCart();
  },

  async loadCart() {
    this.setData({ loading: true });
    try {
      const items = await get<any[]>("/cart/items");
      this.setData({ items });
      this.calcTotal();
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelect(e: any) {
    const id = e.currentTarget.dataset.id;
    let { selectedIds } = this.data;
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter((i) => i !== id);
    } else {
      selectedIds.push(id);
    }
    this.setData({ selectedIds });
    this.calcTotal();
  },

  onSelectAll() {
    const { items, selectedIds } = this.data;
    if (selectedIds.length === items.length) {
      this.setData({ selectedIds: [] });
    } else {
      this.setData({ selectedIds: items.map((i) => i.id) });
    }
    this.calcTotal();
  },

  calcTotal() {
    const { items, selectedIds } = this.data;
    const total = items
      .filter((i) => selectedIds.includes(i.id))
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
    this.setData({ totalPrice: total });
  },

  async onQuantityChange(e: any) {
    const { id, type } = e.currentTarget.dataset;
    const item = this.data.items.find((i) => i.id === id);
    if (!item) return;

    let qty = item.quantity;
    if (type === "minus" && qty > 1) qty--;
    if (type === "plus") qty++;

    try {
      await post(`/cart/items/${id}`, { quantity: qty });
      item.quantity = qty;
      this.setData({ items: this.data.items });
      this.calcTotal();
    } catch (err) {
      // handled
    }
  },

  async onDelete(e: any) {
    const id = e.currentTarget.dataset.id;
    const confirmed = await showConfirm("确定删除该商品？");
    if (!confirmed) return;

    try {
      await del(`/cart/items/${id}`);
      this.setData({
        items: this.data.items.filter((i) => i.id !== id),
        selectedIds: this.data.selectedIds.filter((i) => i !== id),
      });
      this.calcTotal();
      showToast("已删除");
    } catch (err) {
      // handled
    }
  },

  onCheckout() {
    if (this.data.selectedIds.length === 0) {
      showToast("请选择商品");
      return;
    }
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    // TODO: 跳转到结算页
    showToast("结算功能开发中");
  },
});
