import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Tabs,
  Card,
  Row,
  Col,
  Tag,
  Spin,
  Empty,
  message,
} from "antd";
import { get } from "@/api/request";

const { Title, Text } = Typography;

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface Post {
  id: number;
  title: string;
  cover: string;
  author: { nickname: string };
  createdAt: string;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (!keyword) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, postRes] = await Promise.all([
          get<{ list: Product[] }>("/api/products", { keyword }),
          get<{ list: Post[] }>("/api/posts", { keyword }),
        ]);
        setProducts(productRes.list || []);
        setPosts(postRes.list || []);
      } catch {
        message.error("搜索失败");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [keyword]);

  if (!keyword) {
    return (
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <Title level={2}>搜索</Title>
        <Empty description="请输入搜索关键词" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Title level={2}>
        搜索结果：<Text type="secondary">{keyword}</Text>
      </Title>

      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "products",
              label: `商品 (${products.length})`,
              children:
                products.length === 0 ? (
                  <Empty description="暂无商品结果" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {products.map((item) => (
                      <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable
                          cover={
                            item.image && (
                              <img
                                alt={item.name}
                                src={item.image}
                                style={{ height: 200, objectFit: "cover" }}
                              />
                            )
                          }
                          onClick={() => navigate(`/clothing/${item.id}`)}
                        >
                          <Card.Meta
                            title={item.name}
                            description={
                              <div>
                                <Tag>{item.category}</Tag>
                                <Text type="danger" strong>
                                  ¥{item.price?.toFixed(2)}
                                </Text>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
            },
            {
              key: "posts",
              label: `游记 (${posts.length})`,
              children:
                posts.length === 0 ? (
                  <Empty description="暂无游记结果" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {posts.map((item) => (
                      <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable
                          cover={
                            item.cover && (
                              <img
                                alt={item.title}
                                src={item.cover}
                                style={{ height: 200, objectFit: "cover" }}
                              />
                            )
                          }
                          onClick={() => navigate(`/community/${item.id}`)}
                        >
                          <Card.Meta
                            title={item.title}
                            description={
                              <div>
                                <Text type="secondary">
                                  {item.author?.nickname}
                                </Text>
                                <br />
                                <Text type="secondary">{item.createdAt}</Text>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
            },
          ]}
        />
      </Spin>
    </div>
  );
}
