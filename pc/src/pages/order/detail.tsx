import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Descriptions,
  Table,
  Tag,
  Card,
  Spin,
  Button,
  Space,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { get } from "@/api/request";

const { Title, Text } = Typography;

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderDetail {
  id: number;
  orderNo: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentTime: string;
  createdAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  remark: string;
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await get<OrderDetail>(`/api/orders/${id}`);
        setOrder(res);
      } catch {
        message.error("获取订单详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const statusConfig = order
    ? STATUS_MAP[order.status] || { color: "default", label: order.status }
    : null;

  const itemColumns = [
    {
      title: "商品",
      key: "name",
      render: (_: any, record: OrderItem) => (
        <Space>
          {record.image && (
            <img
              src={record.image}
              alt={record.name}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          )}
          <Text>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: "单价",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => <Text>¥{price?.toFixed(2)}</Text>,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
    },
    {
      title: "小计",
      key: "subtotal",
      width: 120,
      render: (_: any, record: OrderItem) => (
        <Text type="danger" strong>
          ¥{(record.price * record.quantity).toFixed(2)}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          订单详情
        </Title>
      </Space>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="订单号">
            <Text copyable>{order.orderNo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {order.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">
            {order.paymentMethod || "-"}
          </Descriptions.Item>
          {order.paymentTime && (
            <Descriptions.Item label="支付时间">
              {order.paymentTime}
            </Descriptions.Item>
          )}
          {order.remark && (
            <Descriptions.Item label="备注">{order.remark}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {order.receiverName && (
        <Card title="收货信息" style={{ marginBottom: 24 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="收货人">
              {order.receiverName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {order.receiverPhone}
            </Descriptions.Item>
            <Descriptions.Item label="收货地址">
              {order.receiverAddress}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="商品明细" style={{ marginBottom: 24 }}>
        <Table
          columns={itemColumns}
          dataSource={order.items}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <Text strong style={{ float: "right" }}>
                  合计：
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text type="danger" strong style={{ fontSize: 16 }}>
                  ¥{order.totalAmount?.toFixed(2)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}
