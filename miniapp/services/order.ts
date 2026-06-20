import { get, post } from "./request";

/** 创建订单 */
export const createOrder = (data: {
  orderType: string;
  module: string;
  items: Array<{
    productId?: number;
    productName: string;
    productImage?: string;
    skuId?: number;
    skuName?: string;
    price: number;
    quantity: number;
  }>;
  remark?: string;
}) => post<any>("/order/create", data);

/** 订单列表 */
export const getOrderList = (params: {
  status?: string;
  orderType?: string;
  page?: number;
  pageSize?: number;
}) => get<{ list: any[]; total: number }>("/order/list", params);

/** 订单详情 */
export const getOrderDetail = (id: number) => get<any>(`/order/${id}`);

/** 取消订单 */
export const cancelOrder = (id: number, reason: string) =>
  post(`/order/${id}/cancel`, { reason });
