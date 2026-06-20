import { get, post } from "./request";

/** 获取商品分类 */
export const getCategories = () => get<any[]>("/product/categories");

/** 获取商品列表 */
export const getProductList = (params: {
  categoryId?: number;
  keyword?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) => get<{ list: any[]; total: number }>("/product/list", params);

/** 获取商品详情 */
export const getProductDetail = (id: number) => get<any>(`/product/${id}`);

/** 收藏/取消收藏 */
export const toggleFavorite = (targetId: number) =>
  post("/favorite/toggle", { targetType: "PRODUCT", targetId });

/** 获取收藏列表 */
export const getFavorites = (targetType: string) =>
  get<any[]>("/favorite/list", { targetType });
