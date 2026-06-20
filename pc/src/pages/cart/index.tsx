import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  Button,
  Space,
  InputNumber,
  Image,
  Empty,
  Card,
  message,
} from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface CartItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  skuName?: string;
}

export default function CartIndex() {
  const navigate = useNavigate();

  // Static placeholder data
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      productId: 101,
      name: "苗族银饰手镯",
      image: "",
      price: 299,
      quantity: 1,
      skuName: "S码",
    },
    {
      id: 2,
      productId: 102,
      name: "蜡染围巾",
      image: "",
      price: 168,
      quantity: 2,
    },
  ]);

  const handleQuantityChange = (id: number, value: number | null) => {
    if (!value || value < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: value } : item,
      ),
    );
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    message.success("已移除");
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const columns = [
    {
      title: "商品",
      key: "product",
      render: (_: any, record: CartItem) => (
        <Space>
          <Image
            src={record.image || undefined}
            width={80}
            height={80}
            style={{
              borderRadius: 4,
              objectFit: "cover",
              background: "#f5f5f5",
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
          />
          <div>
            <Text strong>{record.name}</Text>
            {record.skuName && (
              <div>
                <Text type="secondary">{record.skuName}</Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "单价",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => <Text type="danger">¥{price.toFixed(2)}</Text>,
    },
    {
      title: "数量",
      key: "quantity",
      width: 120,
      render: (_: any, record: CartItem) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(val) => handleQuantityChange(record.id, val)}
        />
      ),
    },
    {
      title: "小计",
      key: "subtotal",
      width: 120,
      render: (_: any, record: CartItem) => (
        <Text type="danger" strong>
          ¥{(record.price * record.quantity).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 80,
      render: (_: any, record: CartItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2}>购物车</Title>

      {items.length === 0 ? (
        <Empty description="购物车是空的">
          <Button type="primary" onClick={() => navigate("/")}>
            去逛逛
          </Button>
        </Empty>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
          />

          <Card style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 24,
              }}
            >
              <Text>
                共 <Text strong>{items.length}</Text> 件商品
              </Text>
              <Text style={{ fontSize: 18 }}>
                合计:{" "}
                <Text type="danger" strong style={{ fontSize: 24 }}>
                  ¥{totalPrice.toFixed(2)}
                </Text>
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => message.info("结算功能开发中，敬请期待")}
              >
                结算
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
