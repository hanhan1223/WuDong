import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Spin,
  Empty,
  Card,
  message,
} from "antd";
import { get } from "@/api/request";

const { Title, Text } = Typography;

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNo: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
  createdAt: string;
}

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING_PAYMENT: { color: "orange", label: "待支付" },
  PAID: { color: "blue", label: "已支付" },
  CONFIRMED: { color: "cyan", label: "已确认" },
  IN_PROGRESS: { color: "geekblue", label: "进行中" },
  COMPLETED: { color: "green", label: "已完成" },
  CANCELLED: { color: "default", label: "已取消" },
  REFUNDED: { color: "red", label: "已退款" },
};

const OrderStatusTag: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_MAP[status] || { color: "default", label: status };
  return <Tag color={config.color}>{config.label}</Tag>;
};

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await get("/api/orders/list");
        setOrders(res.list || []);
      } catch {
        message.error("获取订单列表失败");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns = [
    {
      title: "订单号",
      dataIndex: "orderNo",
      key: "orderNo",
      width: 200,
      render: (orderNo: string) => <Text copyable>{orderNo}</Text>,
    },
    {
      title: "商品",
      key: "items",
      render: (_: any, record: Order) => (
        <Space direction="vertical" size={4}>
          {record.items?.slice(0, 3).map((item) => (
            <Space key={item.id}>
              <Text>{item.name}</Text>
              <Text type="secondary">x{item.quantity}</Text>
            </Space>
          ))}
          {record.items?.length > 3 && (
            <Text type="secondary">等{record.items.length}件商品</Text>
          )}
        </Space>
      ),
    },
    {
      title: "金额",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount: number) => (
        <Text type="danger" strong>
          ¥{amount?.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => <OrderStatusTag status={status} />,
    },
    {
      title: "下单时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: any, record: Order) => (
        <Space>
          <Button type="link" size="small">
            详情
          </Button>
          {record.status === "PENDING_PAYMENT" && (
            <Button type="link" size="small">
              去支付
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Title level={2}>我的订单</Title>

      <Spin spinning={loading}>
        {orders.length === 0 && !loading ? (
          <Empty description="暂无订单">
            <Button type="primary" onClick={() => navigate("/")}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )}
      </Spin>
    </div>
  );
}
