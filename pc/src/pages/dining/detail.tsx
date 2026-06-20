import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Form,
  DatePicker,
  Select,
  InputNumber,
  Input,
  Spin,
  Empty,
  message,
  Divider,
  Card,
  Rate,
  Tag,
  List,
} from "antd";
import { EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { get, post } from "@/api/request";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface Dish {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
}

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface RestaurantDetail {
  id: number;
  name: string;
  image: string;
  rating: number;
  address: string;
  phone: string;
  description: string;
  dishes: Dish[];
  timeSlots: TimeSlot[];
}

export default function DiningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const res = await get(`/api/restaurants/${id}`);
        setRestaurant(res.data);
      } catch {
        message.error("获取餐厅详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleBooking = async (values: any) => {
    setBooking(true);
    try {
      await post(`/restaurants/${id}/book`, {
        restaurantId: Number(id),
        bookingDate: values.bookingDate,
        timeSlotId: values.timeSlotId,
        guestCount: values.guestCount,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
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

  if (!restaurant) {
    return <Empty description="餐厅不存在" style={{ padding: 100 }} />;
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
        <Col xs={24} md={16}>
          <div
            style={{ borderRadius: 8, overflow: "hidden", marginBottom: 24 }}
          >
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{ width: "100%", maxHeight: 400, objectFit: "cover" }}
            />
          </div>

          <Title level={3}>{restaurant.name}</Title>
          <Rate disabled defaultValue={restaurant.rating} allowHalf />
          <Text style={{ marginLeft: 8 }}>{restaurant.rating}分</Text>
          <div style={{ marginTop: 8 }}>
            <EnvironmentOutlined />{" "}
            <Text type="secondary">{restaurant.address}</Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <ClockCircleOutlined />{" "}
            <Text type="secondary">电话: {restaurant.phone}</Text>
          </div>

          <Divider />
          <Title level={4}>餐厅介绍</Title>
          <Paragraph>{restaurant.description}</Paragraph>

          <Divider />
          <Title level={4}>招牌菜品</Title>
          <Row gutter={[16, 16]}>
            {restaurant.dishes?.map((dish) => (
              <Col key={dish.id} xs={24} sm={12}>
                <Card size="small">
                  <Row gutter={12}>
                    <Col span={8}>
                      <img
                        src={dish.image}
                        alt={dish.name}
                        style={{
                          width: "100%",
                          borderRadius: 4,
                          objectFit: "cover",
                          height: 80,
                        }}
                      />
                    </Col>
                    <Col span={16}>
                      <Text strong>{dish.name}</Text>
                      <br />
                      <Text type="danger">¥{dish.price.toFixed(2)}</Text>
                      <br />
                      <Text type="secondary" ellipsis>
                        {dish.description}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} md={8}>
          <Card title="在线预订" style={{ position: "sticky", top: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleBooking}>
              <Form.Item
                name="bookingDate"
                label="预订日期"
                rules={[{ required: true, message: "请选择日期" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="timeSlotId"
                label="用餐时段"
                rules={[{ required: true, message: "请选择时段" }]}
              >
                <Select placeholder="选择时段">
                  {restaurant.timeSlots?.map((slot) => (
                    <Option
                      key={slot.id}
                      value={slot.id}
                      disabled={!slot.available}
                    >
                      {slot.startTime} - {slot.endTime}
                      {!slot.available && " (已满)"}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="guestCount"
                label="用餐人数"
                rules={[{ required: true, message: "请输入人数" }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: "100%" }}
                  placeholder="用餐人数"
                />
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
