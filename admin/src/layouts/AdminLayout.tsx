import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  SkinOutlined,
  CoffeeOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  OrderedListOutlined,
  DollarOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileSearchOutlined,
  AlertOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../store/useAuthStore";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "数据看板" },
  { key: "/user", icon: <UserOutlined />, label: "用户管理" },
  { key: "/merchant", icon: <ShopOutlined />, label: "商家管理" },
  { key: "/clothing", icon: <SkinOutlined />, label: "衣-商品管理" },
  { key: "/dining", icon: <CoffeeOutlined />, label: "食-餐饮管理" },
  { key: "/homestay", icon: <HomeOutlined />, label: "住-住宿管理" },
  { key: "/travel", icon: <EnvironmentOutlined />, label: "行-票务管理" },
  { key: "/community", icon: <TeamOutlined />, label: "社区管理" },
  { key: "/moderation", icon: <FileSearchOutlined />, label: "内容审核" },
  { key: "/report", icon: <AlertOutlined />, label: "举报管理" },
  { key: "/order", icon: <OrderedListOutlined />, label: "订单管理" },
  { key: "/finance", icon: <DollarOutlined />, label: "财务结算" },
  { key: "/content", icon: <PictureOutlined />, label: "内容运营" },
  { key: "/system", icon: <SettingOutlined />, label: "系统设置" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dropdownItems = {
    items: [
      { key: "profile", label: "个人中心", icon: <UserOutlined /> },
      { type: "divider" as const },
      {
        key: "logout",
        label: "退出登录",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") handleLogout();
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#001529",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text strong style={{ color: "#fff", fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? "乌东" : "乌东文旅管理后台"}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[
            location.pathname.startsWith("/dashboard")
              ? "/dashboard"
              : "/" + location.pathname.split("/")[1],
          ]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 220, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <span
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, cursor: "pointer" }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Dropdown menu={dropdownItems}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <Text>{user?.nickname || "管理员"}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            minHeight: 360,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
