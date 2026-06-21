import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Carousel,
  Typography,
  Spin,
  Rate,
  Tag,
  Space,
  Grid,
} from "antd";
import {
  SkinOutlined,
  CoffeeOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FireOutlined,
  StarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { get } from "@/api/request";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

/* ========== 类型定义 ========== */

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

interface Product {
  id: number;
  title: string;
  mainImage: string;
  price: number;
  sales?: number;
}

interface Restaurant {
  id: number;
  name: string;
  mainImage: string;
  rating: number;
  address: string;
}

interface Homestay {
  id: number;
  name: string;
  mainImage: string;
  rating: number;
  address: string;
  price?: number;
}

interface ScenicSpot {
  id: number;
  name: string;
  mainImage: string;
  description: string;
  address: string;
}

interface Post {
  id: number;
  title: string;
  coverImage?: string;
  images?: string;
  user?: { nickname: string; avatar: string };
  likeCount: number;
  viewCount: number;
}

/* ========== 金刚区入口配置 ========== */

const categories = [
  {
    key: "clothing",
    name: "非遗好物",
    icon: <SkinOutlined />,
    color: "#E85D2F",
    desc: "苗绣·银饰·蜡染",
  },
  {
    key: "dining",
    name: "苗乡美食",
    icon: <CoffeeOutlined />,
    color: "#6B8E3D",
    desc: "酸汤·腊肉·米酒",
  },
  {
    key: "homestay",
    name: "吊脚楼民宿",
    icon: <HomeOutlined />,
    color: "#D4A14B",
    desc: "依山傍水·苗家风情",
  },
  {
    key: "travel",
    name: "山水之旅",
    icon: <EnvironmentOutlined />,
    color: "#1F5FA8",
    desc: "雷公山·西江苗寨",
  },
  {
    key: "community",
    name: "旅友社区",
    icon: <TeamOutlined />,
    color: "#8B5CF6",
    desc: "攻略·笔记·分享",
  },
];

/* ========== 首页组件 ========== */

export default function Home() {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [scenicSpots, setScenicSpots] = useState<ScenicSpot[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      get<Banner[]>("/banners"),
      get<{ list: Product[] }>("/api/products", {
        pageSize: 8,
        orderBy: "sales",
      }),
      get<{ list: Restaurant[] }>("/api/restaurants", { pageSize: 4 }),
      get<{ list: Homestay[] }>("/api/homestays", { pageSize: 4 }),
      get<{ list: ScenicSpot[] }>("/api/scenic-spots", { pageSize: 4 }),
      get<{ list: Post[] }>("/api/posts", { pageSize: 6 }),
    ]);

    const extract = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
      r.status === "fulfilled" ? r.value : fallback;

    setBanners(extract(results[0], []));
    setHotProducts(extract(results[1], { list: [] }).list || []);
    setRestaurants(extract(results[2], { list: [] }).list || []);
    setHomestays(extract(results[3], { list: [] }).list || []);
    setScenicSpots(extract(results[4], { list: [] }).list || []);
    setPosts(extract(results[5], { list: [] }).list || []);
    setLoading(false);
  };

  /** 通用卡片尺寸 */
  const cardImgHeight = screens.md ? 200 : 150;

  return (
    <Spin spinning={loading}>
      {/* ========== 轮播图 ========== */}
      <div style={{ maxWidth: 1200, margin: "0 auto", marginBottom: 32 }}>
        <Carousel autoplay effect="fade" dots={{ className: "banner-dots" }}>
          {banners.length > 0 ? (
            banners.map((b) => (
              <div key={b.id}>
                <div
                  onClick={() => b.linkUrl && navigate(b.linkUrl)}
                  style={{
                    height: screens.md ? 400 : 200,
                    background: `linear-gradient(135deg, #1F5FA8 0%, #0E3D75 100%)`,
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: b.linkUrl ? "pointer" : "default",
                    position: "relative",
                  }}
                >
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "40px 32px 24px",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.6))",
                      color: "#fff",
                    }}
                  >
                    <Title level={3} style={{ color: "#fff", margin: 0 }}>
                      {b.title}
                    </Title>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <div
                style={{
                  height: screens.md ? 400 : 200,
                  background:
                    "linear-gradient(135deg, #1F5FA8 0%, #0E3D75 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#fff",
                }}
              >
                <Title level={1} style={{ color: "#fff", marginBottom: 8 }}>
                  乌东文旅
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 18 }}>
                  贵州雷山 · 苗族文化旅游平台
                </Text>
              </div>
            </div>
          )}
        </Carousel>
      </div>

      {/* ========== 金刚区入口 ========== */}
      <div style={{ maxWidth: 1200, margin: "0 auto 40px" }}>
        <Row gutter={[16, 16]}>
          {categories.map((cat) => (
            <Col key={cat.key} xs={12} sm={8} md={4} flex="auto">
              <Card
                hoverable
                onClick={() => navigate(`/${cat.key}`)}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  borderTop: `3px solid ${cat.color}`,
                }}
                bodyStyle={{ padding: "24px 16px" }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `${cat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    fontSize: 24,
                    color: cat.color,
                  }}
                >
                  {cat.icon}
                </div>
                <Text strong style={{ fontSize: 16, display: "block" }}>
                  {cat.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {cat.desc}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ========== 热门非遗好物 ========== */}
      {hotProducts.length > 0 && (
        <Section
          title="热门非遗好物"
          icon={<FireOutlined style={{ color: "#E85D2F" }} />}
          moreLink="/clothing"
        >
          <Row gutter={[16, 16]}>
            {hotProducts.slice(0, 4).map((p) => (
              <Col key={p.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: cardImgHeight,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={p.title}
                        src={p.mainImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/clothing/${p.id}`)}
                  style={{ borderRadius: 8 }}
                >
                  <Card.Meta
                    title={<Text ellipsis>{p.title}</Text>}
                    description={
                      <Text type="danger" strong style={{ fontSize: 16 }}>
                        ¥{p.price?.toFixed(2)}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Section>
      )}

      {/* ========== 苗乡美食 ========== */}
      {restaurants.length > 0 && (
        <Section
          title="苗乡美食"
          icon={<CoffeeOutlined style={{ color: "#6B8E3D" }} />}
          moreLink="/dining"
        >
          <Row gutter={[16, 16]}>
            {restaurants.map((r) => (
              <Col key={r.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: cardImgHeight,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={r.name}
                        src={r.mainImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/dining/${r.id}`)}
                  style={{ borderRadius: 8 }}
                >
                  <Card.Meta
                    title={<Text ellipsis>{r.name}</Text>}
                    description={
                      <Space direction="vertical" size={2}>
                        <Rate
                          disabled
                          defaultValue={r.rating}
                          allowHalf
                          style={{ fontSize: 14 }}
                        />
                        <Text
                          type="secondary"
                          ellipsis
                          style={{ fontSize: 12 }}
                        >
                          {r.address}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Section>
      )}

      {/* ========== 吊脚楼民宿 ========== */}
      {homestays.length > 0 && (
        <Section
          title="吊脚楼民宿"
          icon={<HomeOutlined style={{ color: "#D4A14B" }} />}
          moreLink="/homestay"
        >
          <Row gutter={[16, 16]}>
            {homestays.map((h) => (
              <Col key={h.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: cardImgHeight,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={h.name}
                        src={h.mainImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/homestay/${h.id}`)}
                  style={{ borderRadius: 8 }}
                >
                  <Card.Meta
                    title={<Text ellipsis>{h.name}</Text>}
                    description={
                      <Space direction="vertical" size={2}>
                        <Rate
                          disabled
                          defaultValue={h.rating}
                          allowHalf
                          style={{ fontSize: 14 }}
                        />
                        <Text
                          type="secondary"
                          ellipsis
                          style={{ fontSize: 12 }}
                        >
                          {h.address}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Section>
      )}

      {/* ========== 山水之旅 ========== */}
      {scenicSpots.length > 0 && (
        <Section
          title="山水之旅"
          icon={<EnvironmentOutlined style={{ color: "#1F5FA8" }} />}
          moreLink="/travel"
        >
          <Row gutter={[16, 16]}>
            {scenicSpots.map((s) => (
              <Col key={s.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: cardImgHeight,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={s.name}
                        src={s.mainImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/travel/${s.id}`)}
                  style={{ borderRadius: 8 }}
                >
                  <Card.Meta
                    title={<Text ellipsis>{s.name}</Text>}
                    description={
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        type="secondary"
                        style={{ fontSize: 12, margin: 0 }}
                      >
                        {s.description}
                      </Paragraph>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Section>
      )}

      {/* ========== 社区精选 ========== */}
      {posts.length > 0 && (
        <Section
          title="旅友精选"
          icon={<StarOutlined style={{ color: "#8B5CF6" }} />}
          moreLink="/community"
        >
          <Row gutter={[16, 16]}>
            {posts.slice(0, 6).map((post) => {
              const coverUrl = post.images?.split(",")[0] || post.coverImage;
              return (
                <Col key={post.id} xs={12} sm={8} md={4}>
                  <Card
                    hoverable
                    cover={
                      coverUrl ? (
                        <div
                          style={{
                            height: 160,
                            overflow: "hidden",
                            background: "#f5f5f5",
                          }}
                        >
                          <img
                            alt={post.title}
                            src={coverUrl}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 160,
                            background:
                              "linear-gradient(135deg, #E8F1FB, #f0f0f0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TeamOutlined
                            style={{ fontSize: 32, color: "#1F5FA8" }}
                          />
                        </div>
                      )
                    }
                    onClick={() => navigate(`/community/${post.id}`)}
                    style={{ borderRadius: 8 }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <Text
                      ellipsis
                      style={{ display: "block", fontWeight: 500 }}
                    >
                      {post.title}
                    </Text>
                    <Space size={12} style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ❤ {post.likeCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        👁 {post.viewCount}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Section>
      )}

      {/* ========== 介绍横幅 ========== */}
      <div
        style={{
          maxWidth: 1200,
          margin: "40px auto",
          padding: "48px 40px",
          background: "linear-gradient(135deg, #1F5FA8 0%, #0E3D75 100%)",
          borderRadius: 12,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ color: "#fff", marginBottom: 16 }}>
          乌东苗寨 · 等你来探
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
          位于贵州省雷山县的乌东村，是一座保存完好的苗族传统村落。
          这里有依山而建的吊脚楼、精美的苗绣银饰、热情的苗家长桌宴，
          以及雷公山原始森林的壮美风光。
        </Text>
      </div>
    </Spin>
  );
}

/* ========== 通用分段组件 ========== */

function Section({
  title,
  icon,
  moreLink,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  moreLink: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Space>
          {icon}
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
        </Space>
        <a
          onClick={() => navigate(moreLink)}
          style={{ color: "#1F5FA8", fontSize: 14 }}
        >
          查看更多 <ArrowRightOutlined />
        </a>
      </div>
      {children}
    </div>
  );
}
