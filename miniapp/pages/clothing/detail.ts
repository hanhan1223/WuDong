import { getProductDetail, toggleFavorite } from "../../services/product";
import { createOrder } from "../../services/order";
import { post } from "../../services/request";
import { showToast, showLoading, hideLoading } from "../../utils/util";

const app = getApp();

Page({
  data: {
    product: null as any,
    currentSku: null as any,
    showSkuPicker: false,
    quantity: 1,
    isFavorite: false,
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadProduct(options.id);
    }
  },

  async loadProduct(id: string) {
    showLoading();
    try {
      const product = await getProductDetail(Number(id));
      this.setData({
        product,
        currentSku: product.skus?.[0] || null,
      });
    } catch (err) {
      showToast("加载失败");
    } finally {
      hideLoading();
    }
  },

  /** 选择SKU */
  onSkuTap(e: any) {
    const sku = e.currentTarget.dataset.sku;
    this.setData({ currentSku: sku });
  },

  /** 修改数量 */
  onQuantityChange(e: any) {
    const type = e.currentTarget.dataset.type;
    let { quantity } = this.data;
    if (type === "minus" && quantity > 1) quantity--;
    if (type === "plus") quantity++;
    this.setData({ quantity });
  },

  /** 显示SKU选择器 */
  showSkuPicker() {
    this.setData({ showSkuPicker: true });
  },

  hideSkuPicker() {
    this.setData({ showSkuPicker: false });
  },

  /** 加入购物车 */
  async onAddCart() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    const { product, currentSku, quantity } = this.data;
    // 如果商品有SKU但未选择，提示用户
    if (product.skus && product.skus.length > 0 && !currentSku) {
      showToast("请选择规格");
      return;
    }
    try {
      await post("/cart/add", {
        productId: product.id,
        skuId: currentSku?.id || undefined,
        quantity,
      });
      showToast("已加入购物车", "success");
    } catch (err) {
      // handled by interceptor
    }
  },

  /** 立即购买 */
  onBuyNow() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    const { product, currentSku } = this.data;
    if (product.skus && product.skus.length > 0 && !currentSku) {
      showToast("请选择规格");
      return;
    }
    this.createOrder();
  },

  async createOrder() {
    showLoading();
    try {
      const { product, currentSku, quantity } = this.data;
      const order = await createOrder({
        orderType: "PRODUCT",
        module: "CLOTHING",
        items: [
          {
            productId: product.id,
            productName: product.title,
            productImage: product.mainImage,
            skuId: currentSku?.id,
            skuName: currentSku?.specName,
            price: currentSku?.price || product.price,
            quantity,
          },
        ],
      });
      wx.navigateTo({ url: `/pages/order/detail?id=${order.id}` });
    } catch (err) {
      // handled
    } finally {
      hideLoading();
    }
  },

  /** 收藏 */
  async onToggleFavorite() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    try {
      await toggleFavorite(this.data.product.id);
      this.setData({ isFavorite: !this.data.isFavorite });
      showToast(this.data.isFavorite ? "已收藏" : "已取消收藏", "success");
    } catch (err) {
      // handled
    }
  },
});
