import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Form,
  DatePicker,
  InputNumber,
  Input,
  Spin,
  Empty,
  message,
  Divider,
  Card,
  Rate,
  Tag,
  Image,
} from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { get, post } from "@/api/request";

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

interface RoomType {
  id: number;
  name: string;
  image: string;
  price: number;
  capacity: number;
  description: string;
  available: number;
}

interface HomestayDetail {
  id: number;
  name: string;
  images: string[];
  image: string;
  rating: number;
  address: string;
  phone: string;
  description: string;
  checkinTime: string;
  checkoutTime: string;
  rules: string[];
  roomTypes: RoomType[];
}

export default function HomestayDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchHomestay = async () => {
      setLoading(true);
      try {
        const res = await get(`/api/homestays/${id}`);
        setHomestay(res.data);
        if (res.data?.roomTypes?.length > 0) {
          setSelectedRoom(res.data.roomTypes[0].id);
        }
      } catch {
        message.error("获取民宿详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchHomestay();
  }, [id]);

  const handleBooking = async (values: any) => {
    if (!selectedRoom) {
      message.warning("请选择房型");
      return;
    }
    setBooking(true);
    try {
      const [checkIn, checkOut] = values.dates || [];
      await post(`/homestays/${id}/book`, {
        roomTypeId: selectedRoom,
        checkIn: checkIn?.format("YYYY-MM-DD"),
        checkOut: checkOut?.format("YYYY-MM-DD"),
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

  if (!homestay) {
    return <Empty description="民宿不存在" style={{ padding: 100 }} />;
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
          <Image.PreviewGroup>
            <Image
              src={homestay.images?.[0] || homestay.image}
              alt={homestay.name}
              style={{
                width: "100%",
                borderRadius: 8,
                maxHeight: 400,
                objectFit: "cover",
              }}
            />
            <Row gutter={8} style={{ marginTop: 8 }}>
              {(homestay.images || []).slice(1, 5).map((img, idx) => (
                <Col key={idx} span={6}>
                  <Image src={img} style={{ borderRadius: 4 }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>

          <Title level={3} style={{ marginTop: 24 }}>
            {homestay.name}
          </Title>
          <Rate disabled defaultValue={homestay.rating} allowHalf />
          <Text style={{ marginLeft: 8 }}>{homestay.rating}分</Text>
          <div style={{ marginTop: 8 }}>
            <EnvironmentOutlined />{" "}
            <Text type="secondary">{homestay.address}</Text>
          </div>

          <Divider />
          <Title level={4}>民宿介绍</Title>
          <Paragraph>{homestay.description}</Paragraph>

          <Divider />
          <Title level={4}>入住须知</Title>
          <Paragraph>
            入住时间: {homestay.checkinTime} | 退房时间: {homestay.checkoutTime}
          </Paragraph>
          {homestay.rules?.map((rule, idx) => (
            <Paragraph key={idx}>&bull; {rule}</Paragraph>
          ))}

          <Divider />
          <Title level={4}>房型选择</Title>
          <Row gutter={[16, 16]}>
            {homestay.roomTypes?.map((room) => (
              <Col key={room.id} xs={24} sm={12}>
                <Card
                  hoverable
                  style={{
                    border:
                      selectedRoom === room.id
                        ? "2px solid #1890ff"
                        : undefined,
                  }}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <Row gutter={12}>
                    <Col span={10}>
                      <img
                        src={room.image}
                        alt={room.name}
                        style={{
                          width: "100%",
                          borderRadius: 4,
                          objectFit: "cover",
                          height: 100,
                        }}
                      />
                    </Col>
                    <Col span={14}>
                      <Text strong>{room.name}</Text>
                      <br />
                      <Text type="danger" style={{ fontSize: 18 }}>
                        ¥{room.price}/晚
                      </Text>
                      <br />
                      <Text type="secondary">可住 {room.capacity} 人</Text>
                      <br />
                      <Tag color={room.available > 0 ? "green" : "red"}>
                        {room.available > 0
                          ? `剩余 ${room.available} 间`
                          : "已满"}
                      </Tag>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} md={8}>
          <Card title="预订房间" style={{ position: "sticky", top: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleBooking}>
              <Form.Item
                name="dates"
                label="入住日期"
                rules={[{ required: true, message: "请选择日期" }]}
              >
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="roomCount"
                label="房间数"
                rules={[{ required: true, message: "请输入房间数" }]}
              >
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="guestCount"
                label="入住人数"
                rules={[{ required: true, message: "请输入人数" }]}
              >
                <InputNumber min={1} max={20} style={{ width: "100%" }} />
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
