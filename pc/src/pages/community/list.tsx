import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Empty,
  Tag,
  Space,
  Avatar,
  message,
} from "antd";
import { LikeOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import { get } from "@/api/request";

const { Title, Text, Paragraph } = Typography;

interface Post {
  id: number;
  title: string;
  content: string;
  coverImage: string;
  author: {
    id: number;
    nickname: string;
    avatar: string;
  };
  likeCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
}

export default function CommunityList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await get("/api/posts");
      setPosts(res.list || []);
    } catch {
      message.error("获取游记列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>旅行社区</Title>

      <Spin spinning={loading}>
        {posts.length === 0 && !loading ? (
          <Empty description="暂无游记" />
        ) : (
          <Row gutter={[16, 16]}>
            {posts.map((post) => (
              <Col key={post.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  cover={
                    post.coverImage && (
                      <div
                        style={{
                          height: 200,
                          overflow: "hidden",
                          background: "#f5f5f5",
                        }}
                      >
                        <img
                          alt={post.title}
                          src={post.coverImage}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )
                  }
                  onClick={() => navigate(`/community/${post.id}`)}
                >
                  <Title
                    level={5}
                    ellipsis={{ rows: 1 }}
                    style={{ marginBottom: 8 }}
                  >
                    {post.title}
                  </Title>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 12, minHeight: 44 }}
                  >
                    {post.content}
                  </Paragraph>

                  {post.tags && post.tags.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {post.tags.map((tag, idx) => (
                        <Tag key={idx} color="blue">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <Avatar
                        src={post.author?.avatar}
                        icon={<UserOutlined />}
                        size="small"
                      />
                      <Text type="secondary">
                        {post.author?.nickname || "匿名"}
                      </Text>
                    </Space>
                    <Space>
                      <Text type="secondary">
                        <LikeOutlined /> {post.likeCount}
                      </Text>
                      <Text type="secondary">
                        <EyeOutlined /> {post.viewCount}
                      </Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
