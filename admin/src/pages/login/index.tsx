import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../store/useAuthStore";
import { post } from "../../api/request";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await post<{ token: string; user: any }>(
        "/admin/login",
        values,
      );
      login(res.token, res.user);
      message.success("登录成功");
      navigate("/dashboard");
    } catch (err: any) {
      message.error(err?.message || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1F5FA8 0%, #0E3D75 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8, color: "#1F5FA8" }}>
            乌东文旅
          </Title>
          <Text type="secondary">管理后台</Text>
        </div>
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
