import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Spin,
  Empty,
  Tag,
  Space,
  Avatar,
  Divider,
  Image,
  List,
  Input,
  message,
} from "antd";
import {
  LikeOutlined,
  LikeFilled,
  StarOutlined,
  StarFilled,
  UserOutlined,
  SendOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { get, post as postApi } from "@/api/request";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Author {
  id: number;
  nickname: string;
  avatar: string;
}

interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
}

interface PostDetail {
  id: number;
  title: string;
  content: string;
  images: string[];
  author: Author;
  tags: string[];
  likeCount: number;
  isLiked: boolean;
  isFavorited: boolean;
  viewCount: number;
  comments: Comment[];
  createdAt: string;
}

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await get(`/api/posts/${id}`);
      setPost(res.data);
    } catch {
      message.error("获取游记详情失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    try {
      await postApi(`/api/posts/${id}/like`);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
      });
    } catch {
      message.error("操作失败");
    }
  };

  const handleFavorite = async () => {
    if (!post) return;
    try {
      await postApi(`/api/posts/${id}/favorite`);
      setPost({ ...post, isFavorited: !post.isFavorited });
      message.success(post.isFavorited ? "已取消收藏" : "已收藏");
    } catch {
      message.error("操作失败");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      message.warning("请输入评论内容");
      return;
    }
    setCommenting(true);
    try {
      const res = await postApi(`/api/posts/${id}/comments`, {
        content: commentText,
      });
      const newComment = res.data;
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), newComment],
            }
          : prev,
      );
      setCommentText("");
      message.success("评论成功");
    } catch {
      message.error("评论失败");
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return <Empty description="游记不存在" style={{ padding: 100 }} />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Button
        type="link"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        &larr; 返回
      </Button>

      <Title level={2}>{post.title}</Title>

      <Space style={{ marginBottom: 16 }}>
        <Avatar src={post.author?.avatar} icon={<UserOutlined />} />
        <Text>{post.author?.nickname || "匿名"}</Text>
        <Text type="secondary">{post.createdAt}</Text>
        <Text type="secondary">
          <EyeOutlined /> {post.viewCount}
        </Text>
      </Space>

      {post.tags && post.tags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {post.tags.map((tag, idx) => (
            <Tag key={idx} color="blue">
              {tag}
            </Tag>
          ))}
        </div>
      )}

      <Divider />

      <Paragraph
        style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-wrap" }}
      >
        {post.content}
      </Paragraph>

      {post.images && post.images.length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <Image.PreviewGroup>
            <Row gutter={[8, 8]}>
              {post.images.map((img, idx) => (
                <Col key={idx} span={8}>
                  <Image src={img} style={{ borderRadius: 8, width: "100%" }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      )}

      <Divider />

      <Space size="large">
        <Button
          type={post.isLiked ? "primary" : "default"}
          icon={post.isLiked ? <LikeFilled /> : <LikeOutlined />}
          onClick={handleLike}
        >
          {post.likeCount} 点赞
        </Button>
        <Button
          type={post.isFavorited ? "primary" : "default"}
          icon={post.isFavorited ? <StarFilled /> : <StarOutlined />}
          onClick={handleFavorite}
        >
          {post.isFavorited ? "已收藏" : "收藏"}
        </Button>
      </Space>

      <Divider />

      <Title level={4}>评论 ({post.comments?.length || 0})</Title>

      <div style={{ marginBottom: 24 }}>
        <Row gutter={8}>
          <Col flex="auto">
            <TextArea
              rows={2}
              placeholder="写下你的评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={commenting}
              onClick={handleComment}
            >
              发表
            </Button>
          </Col>
        </Row>
      </div>

      <List
        dataSource={post.comments || []}
        renderItem={(comment) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar src={comment.author?.avatar} icon={<UserOutlined />} />
              }
              title={
                <Space>
                  <Text strong>{comment.author?.nickname || "匿名"}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {comment.createdAt}
                  </Text>
                </Space>
              }
              description={comment.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
