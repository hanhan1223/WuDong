import React, { useState, useEffect } from "react";
import {
  Typography,
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Avatar,
  List,
  Empty,
  Spin,
  Tag,
  message,
  Space,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  HeartOutlined,
  BellOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { get, put } from "@/api/request";

const { Title, Text } = Typography;

interface UserProfile {
  id: number;
  nickname: string;
  avatar: string;
  phone: string;
  email: string;
  bio: string;
}

interface FavoriteItem {
  id: number;
  title: string;
  image: string;
  type: string;
}

interface MessageItem {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await get("/api/users/profile");
        setProfile(res);
      } catch {
        message.error("获取用户信息失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === "favorites" && favorites.length === 0) {
        try {
          const res = await get("/api/users/favorites");
          setFavorites(res.list || []);
        } catch {
          /* ignore */
        }
      } else if (activeTab === "messages" && messages.length === 0) {
        try {
          const res = await get("/api/users/messages");
          setMessages(res.list || []);
        } catch {
          /* ignore */
        }
      } else if (activeTab === "addresses" && addresses.length === 0) {
        try {
          const res = await get("/api/users/addresses");
          setAddresses(res.list || []);
        } catch {
          /* ignore */
        }
      }
    };
    fetchTabData();
  }, [activeTab]);

  const handleUpdateProfile = async (values: any) => {
    try {
      await put("/users/profile", values);
      message.success("个人信息已更新");
    } catch {
      message.error("更新失败");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar src={profile?.avatar} icon={<UserOutlined />} size={80} />
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              {profile?.nickname || "用户"}
            </Title>
            <Text type="secondary">
              {profile?.phone || profile?.email || ""}
            </Text>
            {profile?.bio && (
              <div>
                <Text type="secondary">{profile.bio}</Text>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "profile",
              label: (
                <span>
                  <EditOutlined /> 个人信息
                </span>
              ),
              children: (
                <Form
                  layout="vertical"
                  initialValues={profile || {}}
                  onFinish={handleUpdateProfile}
                  style={{ maxWidth: 500 }}
                >
                  <Form.Item name="nickname" label="昵称">
                    <Input placeholder="请输入昵称" />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号">
                    <Input placeholder="请输入手机号" disabled />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                  <Form.Item name="bio" label="个人简介">
                    <Input.TextArea
                      rows={3}
                      placeholder="介绍一下自己"
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "favorites",
              label: (
                <span>
                  <HeartOutlined /> 我的收藏
                </span>
              ),
              children:
                favorites.length === 0 ? (
                  <Empty description="暂无收藏" />
                ) : (
                  <List
                    dataSource={favorites}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button type="link" key="view">
                            查看
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              style={{
                                width: 80,
                                height: 60,
                                overflow: "hidden",
                                borderRadius: 4,
                                background: "#f5f5f5",
                              }}
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                            </div>
                          }
                          title={item.title}
                          description={<Tag>{item.type}</Tag>}
                        />
                      </List.Item>
                    )}
                  />
                ),
            },
            {
              key: "messages",
              label: (
                <span>
                  <BellOutlined /> 我的消息
                </span>
              ),
              children:
                messages.length === 0 ? (
                  <Empty description="暂无消息" />
                ) : (
                  <List
                    dataSource={messages}
                    renderItem={(msg) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              {!msg.isRead && <Tag color="red">未读</Tag>}
                              {msg.title}
                            </Space>
                          }
                          description={
                            <div>
                              <Text>{msg.content}</Text>
                              <div>
                                <Text type="secondary">{msg.createdAt}</Text>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ),
            },
            {
              key: "addresses",
              label: (
                <span>
                  <HomeOutlined /> 收货地址
                </span>
              ),
              children: (
                <>
                  <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={() => message.info("功能开发中")}
                  >
                    新增地址
                  </Button>
                  {addresses.length === 0 ? (
                    <Empty description="暂无收货地址" />
                  ) : (
                    <List
                      dataSource={addresses}
                      renderItem={(addr) => (
                        <List.Item
                          actions={[
                            <Button type="link" key="edit">
                              编辑
                            </Button>,
                            <Button type="link" danger key="delete">
                              删除
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{addr.name}</Text>
                                <Text>{addr.phone}</Text>
                                {addr.isDefault && <Tag color="red">默认</Tag>}
                              </Space>
                            }
                            description={`${addr.province}${addr.city}${addr.district}${addr.detail}`}
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
