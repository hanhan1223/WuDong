import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Tabs,
  Typography,
  Spin,
  Empty,
  Tag,
  message,
} from "antd";
import { EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { get } from "@/api/request";

const { Title, Text } = Typography;

interface ScenicSpot {
  id: number;
  name: string;
  image: string;
  address: string;
  price: number;
  description: string;
  openTime: string;
}

interface Route {
  id: number;
  name: string;
  image: string;
  price: number;
  duration: string;
  description: string;
  highlights: string[];
}

export default function TravelList() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState<ScenicSpot[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [activeTab, setActiveTab] = useState("spots");

  const fetchSpots = async () => {
    setLoadingSpots(true);
    try {
      const res = await get("/api/scenic-spots");
      setSpots(res.list || []);
    } catch {
      message.error("获取景区列表失败");
    } finally {
      setLoadingSpots(false);
    }
  };

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const res = await get("/api/routes");
      setRoutes(res.list || []);
    } catch {
      message.error("获取路线列表失败");
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    fetchSpots();
    fetchRoutes();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>探索乌东</Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "spots",
            label: "景区门票",
            children: (
              <Spin spinning={loadingSpots}>
                {spots.length === 0 && !loadingSpots ? (
                  <Empty description="暂无景区" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {spots.map((spot) => (
                      <Col key={spot.id} xs={24} sm={12} md={8} lg={6}>
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
                                alt={spot.name}
                                src={spot.image}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          }
                          onClick={() => navigate(`/travel/scenic/${spot.id}`)}
                        >
                          <Card.Meta
                            title={spot.name}
                            description={
                              <div>
                                <div>
                                  <EnvironmentOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text type="secondary" ellipsis>
                                    {spot.address}
                                  </Text>
                                </div>
                                <div style={{ marginTop: 4 }}>
                                  <ClockCircleOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text type="secondary">{spot.openTime}</Text>
                                </div>
                                <div style={{ marginTop: 4 }}>
                                  <Text type="danger" strong>
                                    ¥{spot.price} 起
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
            ),
          },
          {
            key: "routes",
            label: "路线套餐",
            children: (
              <Spin spinning={loadingRoutes}>
                {routes.length === 0 && !loadingRoutes ? (
                  <Empty description="暂无路线" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {routes.map((route) => (
                      <Col key={route.id} xs={24} sm={12} md={8} lg={6}>
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
                                alt={route.name}
                                src={route.image}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          }
                          onClick={() => navigate(`/travel/route/${route.id}`)}
                        >
                          <Card.Meta
                            title={route.name}
                            description={
                              <div>
                                <div>
                                  <ClockCircleOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text type="secondary">{route.duration}</Text>
                                </div>
                                {route.highlights && (
                                  <div style={{ marginTop: 4 }}>
                                    {route.highlights
                                      .slice(0, 3)
                                      .map((h, idx) => (
                                        <Tag key={idx} color="blue">
                                          {h}
                                        </Tag>
                                      ))}
                                  </div>
                                )}
                                <div style={{ marginTop: 4 }}>
                                  <Text type="danger" strong>
                                    ¥{route.price}
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
            ),
          },
        ]}
      />
    </div>
  );
}
