import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Typography, message } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { get } from "../../api/request";

const { Title } = Typography;

interface DashboardData {
  activeUsers: number;
  todayOrders: number;
  todayGmv: number;
  newUsers: number;
  activeMerchants: number;
  pendingReviews: number;
}

const statCardDefs = [
  {
    key: "activeUsers" as const,
    title: "今日活跃用户",
    icon: <UserOutlined />,
    color: "#1F5FA8",
  },
  {
    key: "todayOrders" as const,
    title: "今日订单数",
    icon: <ShoppingCartOutlined />,
    color: "#E85D2F",
  },
  {
    key: "todayGmv" as const,
    title: "今日GMV",
    prefix: "¥",
    icon: <DollarOutlined />,
    color: "#6B8E3D",
  },
  {
    key: "newUsers" as const,
    title: "新增用户",
    icon: <TeamOutlined />,
    color: "#D4A14B",
  },
  {
    key: "activeMerchants" as const,
    title: "活跃商家",
    icon: <ShopOutlined />,
    color: "#1F5FA8",
  },
  {
    key: "pendingReviews" as const,
    title: "待审核内容",
    icon: <FileTextOutlined />,
    color: "#E85D2F",
  },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    activeUsers: 0,
    todayOrders: 0,
    todayGmv: 0,
    newUsers: 0,
    activeMerchants: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await get<DashboardData>("/admin/dashboard");
      setData(res);
    } catch (err: any) {
      // 如果接口不存在（开发阶段），静默降级到默认值
      console.warn("Dashboard API not available:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        数据看板
      </Title>
      <Row gutter={[16, 16]}>
        {statCardDefs.map((card) => (
          <Col xs={24} sm={12} md={8} key={card.key}>
            <Card hoverable loading={loading}>
              <Statistic
                title={card.title}
                value={data[card.key]}
                prefix={card.prefix || card.icon}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="订单趋势（近7天）" style={{ height: 400 }}>
            <div
              style={{
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8c8c8c",
              }}
            >
              图表区域 - 接入 ECharts
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="模块GMV分布" style={{ height: 400 }}>
            <div
              style={{
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8c8c8c",
              }}
            >
              图表区域 - 接入 ECharts
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
