import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Input, Avatar, Dropdown, Space, Badge } from "antd";
import {
  HomeOutlined,
  SkinOutlined,
  CoffeeOutlined,
  HomeOutlined as HouseOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../store/useAuthStore";

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const navItems = [
  { key: "/", label: "首页", icon: <HomeOutlined /> },
  { key: "/clothing", label: "衣", icon: <SkinOutlined /> },
  { key: "/dining", label: "食", icon: <CoffeeOutlined /> },
  { key: "/homestay", label: "住", icon: <HouseOutlined /> },
  { key: "/travel", label: "行", icon: <EnvironmentOutlined /> },
  { key: "/community", label: "社区", icon: <TeamOutlined /> },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, token, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenu = {
    items: [
      { key: "orders", label: "我的订单", icon: <ShoppingCartOutlined /> },
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
      if (key === "orders") navigate("/orders");
      else if (key === "profile") navigate("/user");
      else if (key === "logout") handleLogout();
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1F5FA8",
            cursor: "pointer",
            marginRight: 48,
          }}
          onClick={() => navigate("/")}
        >
          乌东文旅
        </div>
        <Menu
          mode="horizontal"
          items={navItems}
          style={{ flex: 1, border: "none" }}
          selectedKeys={[pathname]}
          onClick={({ key }) => navigate(key)}
        />
        <Space size="large">
          <Search
            placeholder="搜索目的地、商品..."
            style={{ width: 280 }}
            onSearch={(v) => navigate(`/search?q=${v}`)}
          />
          <Badge count={0} size="small">
            <ShoppingCartOutlined
              style={{ fontSize: 20, cursor: "pointer" }}
              onClick={() => navigate("/cart")}
            />
          </Badge>
          {token ? (
            <Dropdown menu={userMenu}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span>{user?.nickname || "用户"}</span>
              </Space>
            </Dropdown>
          ) : (
            <a onClick={() => navigate("/login")} style={{ color: "#1F5FA8" }}>
              登录
            </a>
          )}
        </Space>
      </Header>
      <Content
        style={{ padding: "24px 48px", minHeight: "calc(100vh - 64px - 60px)" }}
      >
        <Outlet />
      </Content>
      <Footer
        style={{ textAlign: "center", background: "#001529", color: "#fff" }}
      >
        乌东文旅 ©2026 苗族文化旅游平台
      </Footer>
    </Layout>
  );
}
