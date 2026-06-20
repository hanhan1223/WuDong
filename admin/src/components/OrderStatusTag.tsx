import { Tag } from "antd";

/** 订单状态映射 */
const ORDER_STATUS_MAP: Record<string, { color: string; text: string }> = {
  PENDING_PAYMENT: { color: "orange", text: "待支付" },
  PAID: { color: "blue", text: "已支付" },
  CONFIRMED: { color: "cyan", text: "已确认" },
  IN_PROGRESS: { color: "geekblue", text: "进行中" },
  COMPLETED: { color: "green", text: "已完成" },
  CANCELLED: { color: "default", text: "已取消" },
  REFUNDING: { color: "gold", text: "退款中" },
  REFUNDED: { color: "red", text: "已退款" },
};

interface OrderStatusTagProps {
  status: string;
}

/** 订单状态标签组件 */
export default function OrderStatusTag({ status }: OrderStatusTagProps) {
  const config = ORDER_STATUS_MAP[status] || {
    color: "default",
    text: status,
  };
  return <Tag color={config.color}>{config.text}</Tag>;
}
