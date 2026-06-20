import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  List,
  Card,
  Tag,
  Spin,
  Empty,
  Button,
  message,
} from "antd";
import { get } from "@/api/request";

const { Title, Text } = Typography;

interface FavoriteItem {
  id: number;
  title: string;
  image: string;
  type: string;
  targetId: number;
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await get<{ list: FavoriteItem[] }>("/api/favorites");
        setFavorites(res.list || []);
      } catch {
        message.error("获取收藏列表失败");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Title level={2}>我的收藏</Title>

      <Spin spinning={loading}>
        {favorites.length === 0 && !loading ? (
          <Empty description="暂无收藏">
            <Button type="primary" onClick={() => navigate("/")}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={favorites}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    item.image && (
                      <img
                        alt={item.title}
                        src={item.image}
                        style={{ height: 200, objectFit: "cover" }}
                      />
                    )
                  }
                  onClick={() => {
                    const path =
                      item.type === "product"
                        ? `/clothing/${item.targetId}`
                        : `/community/${item.targetId}`;
                    navigate(path);
                  }}
                >
                  <Card.Meta
                    title={item.title}
                    description={<Tag>{item.type}</Tag>}
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </div>
  );
}
