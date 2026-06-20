import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Spin,
  Empty,
  message,
  Divider,
  Card,
  Tag,
  List,
  InputNumber,
  Form,
  Input,
  DatePicker,
  Image,
} from "antd";
import { EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { get, post } from "@/api/request";

const { Title, Paragraph, Text } = Typography;

interface TicketType {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals: string;
}

interface ScenicDetail {
  id: number;
  name: string;
  images: string[];
  image: string;
  address: string;
  description: string;
  openTime: string;
  ticketTypes: TicketType[];
}

interface RouteDetail {
  id: number;
  name: string;
  images: string[];
  image: string;
  price: number;
  duration: string;
  description: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  includes: string[];
}

export default function TravelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "scenic";
  const [data, setData] = useState<ScenicDetail | RouteDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url =
          type === "scenic" ? `/api/scenic-spots/${id}` : `/api/routes/${id}`;
        const res = await get(url);
        setData(res.data);
      } catch {
        message.error("获取详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  const handleBuyTicket = async () => {
    const spot = data as ScenicDetail;
    if (!spot?.ticketTypes) return;
    const activeTickets = spot.ticketTypes.filter(
      (t) => (quantities[t.id] || 0) > 0,
    );
    if (activeTickets.length === 0) {
      message.warning("请选择至少一种票型");
      return;
    }
    setBooking(true);
    try {
      await post("/orders/create", {
        orderType: "TICKET",
        module: "TRAVEL",
        items: activeTickets.map((t) => ({
          productName: t.name,
          price: t.price,
          quantity: quantities[t.id],
        })),
      });
      message.success("下单成功！");
    } catch {
      message.error("下单失败，请重试");
    } finally {
      setBooking(false);
    }
  };

  const handleBookRoute = async (values: any) => {
    setBooking(true);
    try {
      await post("/orders/create", {
        orderType: "ROUTE",
        module: "TRAVEL",
        items: [
          {
            productName: route.name,
            price: route.price,
            quantity: 1,
          },
        ],
      });
      message.success("预订成功！");
      form.resetFields();
    } catch {
      message.error("预订失败，请重试");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <Empty description="详情不存在" style={{ padding: 100 }} />;
  }

  // Scenic spot detail
  if (type === "scenic") {
    const spot = data as ScenicDetail;
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
          <Col xs={24} md={16}>
            <Image.PreviewGroup>
              <Image
                src={spot.images?.[0] || spot.image}
                alt={spot.name}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  maxHeight: 400,
                  objectFit: "cover",
                }}
              />
            </Image.PreviewGroup>
            <Title level={3} style={{ marginTop: 24 }}>
              {spot.name}
            </Title>
            <div>
              <EnvironmentOutlined />{" "}
              <Text type="secondary">{spot.address}</Text>
            </div>
            <div>
              <ClockCircleOutlined />{" "}
              <Text type="secondary">开放时间: {spot.openTime}</Text>
            </div>
            <Divider />
            <Title level={4}>景区介绍</Title>
            <Paragraph>{spot.description}</Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Card title="购票">
              {spot.ticketTypes?.map((ticket) => (
                <div key={ticket.id} style={{ marginBottom: 16 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>{ticket.name}</Text>
                      <br />
                      <Text type="secondary">{ticket.description}</Text>
                      <br />
                      <Text type="danger">¥{ticket.price}</Text>
                      <Tag
                        style={{ marginLeft: 8 }}
                        color={ticket.stock > 0 ? "green" : "red"}
                      >
                        {ticket.stock > 0 ? `余${ticket.stock}` : "售罄"}
                      </Tag>
                    </Col>
                    <Col>
                      <InputNumber
                        min={0}
                        max={ticket.stock}
                        value={quantities[ticket.id] || 0}
                        onChange={(val) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [ticket.id]: val || 0,
                          }))
                        }
                      />
                    </Col>
                  </Row>
                  <Divider style={{ margin: "12px 0" }} />
                </div>
              ))}
              <Button
                type="primary"
                block
                size="large"
                loading={booking}
                onClick={handleBuyTicket}
              >
                立即购买
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Route detail
  const route = data as RouteDetail;
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
        <Col xs={24} md={16}>
          <Image.PreviewGroup>
            <Image
              src={route.images?.[0] || route.image}
              alt={route.name}
              style={{
                width: "100%",
                borderRadius: 8,
                maxHeight: 400,
                objectFit: "cover",
              }}
            />
          </Image.PreviewGroup>
          <Title level={3} style={{ marginTop: 24 }}>
            {route.name}
          </Title>
          <Tag color="blue">{route.duration}</Tag>
          <Text type="danger" style={{ marginLeft: 8, fontSize: 20 }}>
            ¥{route.price}
          </Text>
          <Divider />
          <Title level={4}>路线介绍</Title>
          <Paragraph>{route.description}</Paragraph>
          {route.highlights && (
            <>
              <Title level={4}>路线亮点</Title>
              <div style={{ marginBottom: 16 }}>
                {route.highlights.map((h, idx) => (
                  <Tag key={idx} color="orange" style={{ marginBottom: 8 }}>
                    {h}
                  </Tag>
                ))}
              </div>
            </>
          )}
          {route.itinerary && (
            <>
              <Title level={4}>行程安排</Title>
              <List
                dataSource={route.itinerary}
                renderItem={(day) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Text strong>
                          第{day.day}天: {day.title}
                        </Text>
                      }
                      description={
                        <div>
                          <Paragraph>{day.description}</Paragraph>
                          <Text type="secondary">餐饮: {day.meals}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
          {route.includes && (
            <>
              <Title level={4}>费用包含</Title>
              {route.includes.map((item, idx) => (
                <Paragraph key={idx}>&bull; {item}</Paragraph>
              ))}
            </>
          )}
        </Col>
        <Col xs={24} md={8}>
          <Card title="预订路线" style={{ position: "sticky", top: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleBookRoute}>
              <Form.Item
                name="date"
                label="出发日期"
                rules={[{ required: true, message: "请选择日期" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="guestCount"
                label="人数"
                rules={[{ required: true, message: "请输入人数" }]}
              >
                <InputNumber min={1} max={50} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="contactName"
                label="联系人"
                rules={[{ required: true, message: "请输入联系人" }]}
              >
                <Input placeholder="联系人姓名" />
              </Form.Item>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[{ required: true, message: "请输入电话" }]}
              >
                <Input placeholder="联系电话" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={booking}
                  block
                  size="large"
                >
                  立即预订
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
