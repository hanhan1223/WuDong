/**
 * 业务常量定义
 */

/** 订单状态 */
export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDING: "REFUNDING",
  REFUNDED: "REFUNDED",
} as const;

/** 用户角色 */
export const USER_ROLE = {
  TOURIST: "TOURIST",
  MERCHANT: "MERCHANT",
  ADMIN: "ADMIN",
} as const;

/** 商家模块 */
export const MERCHANT_MODULE = {
  CLOTHING: "CLOTHING",
  DINING: "DINING",
  ACCOMMODATION: "ACCOMMODATION",
  TRAVEL: "TRAVEL",
} as const;

/** 佣金比例 */
export const COMMISSION_RATE = {
  PHYSICAL: 0.05, // 实物商品 5%
  SERVICE: 0.1, // 服务类 10%
} as const;

/** 结算周期 */
export const SETTLEMENT_CYCLE = 7; // T+7 天

/** 分页默认值 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** 文件限制 */
export const FILE_LIMIT = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  VIDEO_MAX_DURATION: 60, // 60秒
  MAX_IMAGES_PER_POST: 9, // 每篇游记最多9张图
} as const;
