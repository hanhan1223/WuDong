import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Form,
  Input,
  Button,
  Upload,
  Tag,
  Space,
  message,
  Card,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { post } from "@/api/request";

const { Title } = Typography;
const { TextArea } = Input;

const PRESET_TAGS = [
  "风景",
  "美食",
  "民宿",
  "非遗文化",
  "苗寨",
  "攻略",
  "亲子游",
  "摄影",
];

export default function CommunityPublish() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = inputTag.trim();
    if (!trimmed) return;
    if (selectedTags.includes(trimmed)) {
      message.warning("标签已存在");
      return;
    }
    if (selectedTags.length >= 5) {
      message.warning("最多选择5个标签");
      return;
    }
    setSelectedTags((prev) => [...prev, trimmed]);
    setInputTag("");
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await post("/api/posts", {
        title: values.title,
        content: values.content,
        tags: selectedTags,
      });
      message.success("发布成功！");
      navigate("/community");
    } catch {
      message.error("发布失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>发布游记</Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input placeholder="给游记起个标题吧" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: "请输入内容" }]}
          >
            <TextArea
              placeholder="分享你的旅行故事..."
              rows={10}
              maxLength={10000}
              showCount
            />
          </Form.Item>

          <Form.Item label="上传图片">
            <Upload
              listType="picture-card"
              maxCount={9}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
            <div style={{ color: "#999", fontSize: 12 }}>
              最多上传9张图片（功能开发中，暂为占位）
            </div>
          </Form.Item>

          <Form.Item label="话题标签">
            <div style={{ marginBottom: 8 }}>
              {PRESET_TAGS.map((tag) => (
                <Tag
                  key={tag}
                  color={selectedTags.includes(tag) ? "blue" : undefined}
                  style={{ cursor: "pointer", marginBottom: 8 }}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Space>
              <Input
                placeholder="自定义标签"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onPressEnter={handleAddCustomTag}
                maxLength={10}
                style={{ width: 160 }}
              />
              <Button size="small" onClick={handleAddCustomTag}>
                添加
              </Button>
            </Space>
            {selectedTags.length > 0 && (
              <div style={{ marginTop: 8 }}>
                已选:{" "}
                {selectedTags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    color="blue"
                    onClose={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
              >
                发布游记
              </Button>
              <Button size="large" onClick={() => navigate(-1)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
