import { getProductList, getCategories } from "../../services/product";

Page({
  data: {
    categories: [] as any[],
    products: [] as any[],
    currentCategory: 0,
    sort: "default",
    page: 1,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadProducts().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadProducts(true);
    }
  },

  async loadCategories() {
    try {
      const categories = await getCategories();
      this.setData({ categories });
    } catch (err) {
      // ignore
    }
  },

  async loadProducts(append = false) {
    this.setData({ loading: true });
    try {
      const res = await getProductList({
        categoryId: this.data.currentCategory || undefined,
        sort: this.data.sort,
        page: this.data.page,
        pageSize: 20,
      });
      this.setData({
        products: append ? [...this.data.products, ...res.list] : res.list,
        hasMore: this.data.products.length < res.total,
      });
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
    }
  },

  onCategoryTap(e: any) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentCategory: id, page: 1, hasMore: true });
    this.loadProducts();
  },

  onSortTap(e: any) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({ sort, page: 1, hasMore: true });
    this.loadProducts();
  },

  onProductTap(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/clothing/detail?id=${id}` });
  },
});
