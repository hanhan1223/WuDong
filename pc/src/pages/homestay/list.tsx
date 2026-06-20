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

interface Homestay {
  id: number;
  name: string;
  image: string;
  rating: number;
  address: string;
  minPrice: number;
  maxPrice: number;
  tags: string[];
}

export default function HomestayList() {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHomestays = async (keyword?: string) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (keyword) params.keyword = keyword;
      const res = await get("/api/homestays", params);
      setHomestays(res.list || []);
    } catch {
      message.error("获取民宿列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomestays();
  }, []);

  const handleSearch = (value: string) => {
    fetchHomestays(value);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>苗寨民宿</Title>

      <Search
        placeholder="搜索民宿..."
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
        {homestays.length === 0 && !loading ? (
          <Empty description="暂无民宿" />
        ) : (
          <Row gutter={[16, 16]}>
            {homestays.map((homestay) => (
              <Col key={homestay.id} xs={24} sm={12} md={8} lg={6}>
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
                        alt={homestay.name}
                        src={homestay.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/homestay/${homestay.id}`)}
                >
                  <Card.Meta
                    title={homestay.name}
                    description={
                      <div>
                        <Rate
                          disabled
                          defaultValue={homestay.rating}
                          allowHalf
                          style={{ fontSize: 14 }}
                        />
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {homestay.rating}分
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          <Text type="secondary" ellipsis>
                            {homestay.address}
                          </Text>
                        </div>
                        {homestay.tags && (
                          <div style={{ marginTop: 4 }}>
                            {homestay.tags.map((tag, idx) => (
                              <Tag key={idx} color="green">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: 4 }}>
                          <Text type="danger">
                            ¥{homestay.minPrice} - ¥{homestay.maxPrice}/晚
                          </Text>
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
