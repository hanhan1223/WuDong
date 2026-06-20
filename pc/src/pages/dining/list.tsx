import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Input,
  Typography,
  Spin,
  Empty,
  Rate,
  Tag,
  message,
} from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { get } from "@/api/request";

const { Title, Text } = Typography;
const { Search } = Input;

interface Restaurant {
  id: number;
  name: string;
  image: string;
  rating: number;
  address: string;
  avgPrice: number;
  tags: string[];
}

export default function DiningList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async (keyword?: string) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (keyword) params.keyword = keyword;
      const res = await get("/api/restaurants", params);
      setRestaurants(res.list || []);
    } catch {
      message.error("获取餐厅列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSearch = (value: string) => {
    fetchRestaurants(value);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>苗乡美食</Title>

      <Search
        placeholder="搜索餐厅..."
        enterButton={
          <>
            <SearchOutlined /> 搜索
          </>
        }
        size="large"
        onSearch={handleSearch}
        allowClear
        style={{ marginBottom: 24, maxWidth: 500 }}
      />

      <Spin spinning={loading}>
        {restaurants.length === 0 && !loading ? (
          <Empty description="暂无餐厅" />
        ) : (
          <Row gutter={[16, 16]}>
            {restaurants.map((restaurant) => (
              <Col key={restaurant.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 180,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={restaurant.name}
                        src={restaurant.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/dining/${restaurant.id}`)}
                >
                  <Card.Meta
                    title={restaurant.name}
                    description={
                      <div>
                        <Rate
                          disabled
                          defaultValue={restaurant.rating}
                          allowHalf
                          style={{ fontSize: 14 }}
                        />
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {restaurant.rating}分
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          <Text type="secondary" ellipsis>
                            {restaurant.address}
                          </Text>
                        </div>
                        {restaurant.tags && (
                          <div style={{ marginTop: 4 }}>
                            {restaurant.tags.map((tag, idx) => (
                              <Tag key={idx} color="orange">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: 4 }}>
                          <Text type="danger">人均 ¥{restaurant.avgPrice}</Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
