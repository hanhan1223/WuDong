import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  InputNumber,
  Spin,
  Empty,
  message,
  Image,
  Tag,
  Space,
  Divider,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { get, post } from "@/api/request";

const { Title, Paragraph, Text } = Typography;

interface Sku {
  id: number;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

interface ProductDetail {
  id: number;
  title: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  skus: Sku[];
}

export default function ClothingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await get(`/api/products/${id}`);
        setProduct(res.data);
        if (res.data?.skus?.length > 0) {
          setSelectedSku(res.data.skus[0]);
        }
      } catch {
        message.error("获取商品详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await post("/api/cart/add", {
        productId: product.id,
        skuId: selectedSku?.id,
        quantity,
      });
      message.success("已加入购物车");
    } catch {
      message.error("加入购物车失败");
    }
  };

  const currentPrice = selectedSku ? selectedSku.price : (product?.price ?? 0);
  const currentStock = selectedSku ? selectedSku.stock : 999;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <Empty description="商品不存在" style={{ padding: 100 }} />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="link"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        &larr; 返回
      </Button>

      <Row gutter={32}>
        <Col xs={24} md={12}>
          <Image.PreviewGroup>
            <Image
              src={product.images?.[0] || product.image}
              alt={product.title}
              style={{ width: "100%", borderRadius: 8 }}
            />
            <Row gutter={8} style={{ marginTop: 8 }}>
              {(product.images || []).map((img, idx) => (
                <Col key={idx} span={6}>
                  <Image src={img} style={{ borderRadius: 4 }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </Col>

        <Col xs={24} md={12}>
          <Title level={3}>{product.title}</Title>
          <Text type="danger" style={{ fontSize: 28, fontWeight: "bold" }}>
            ¥{currentPrice.toFixed(2)}
          </Text>

          <Divider />

          {product.skus && product.skus.length > 0 && (
            <>
              <Text strong>规格选择：</Text>
              <Space wrap style={{ marginTop: 8, marginBottom: 16 }}>
                {product.skus.map((sku) => (
                  <Tag
                    key={sku.id}
                    color={selectedSku?.id === sku.id ? "blue" : undefined}
                    style={{ cursor: "pointer", padding: "4px 12px" }}
                    onClick={() => setSelectedSku(sku)}
                  >
                    {sku.name}
                  </Tag>
                ))}
              </Space>
              <Divider />
            </>
          )}

          <Text strong>数量：</Text>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <InputNumber
              min={1}
              max={currentStock}
              value={quantity}
              onChange={(val) => setQuantity(val || 1)}
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              库存 {currentStock} 件
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
          >
            加入购物车
          </Button>

          <Divider />

          <Title level={5}>商品详情</Title>
          <Paragraph>{product.description}</Paragraph>
        </Col>
      </Row>
    </div>
  );
}
