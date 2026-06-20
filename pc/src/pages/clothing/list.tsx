import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Typography,
  Spin,
  Empty,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { get } from "@/api/request";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ClothingList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined,
  );

  const fetchCategories = async () => {
    try {
      const res = await get("/api/products/categories");
      setCategories(res || []);
    } catch {
      // categories optional, fail silently
    }
  };

  const fetchProducts = async (keyword?: string, categoryId?: number) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (keyword) params.keyword = keyword;
      if (categoryId) params.categoryId = categoryId;
      const res = await get("/api/products", params);
      setProducts(res.list || []);
    } catch {
      message.error("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    fetchProducts(value, selectedCategory);
  };

  const handleCategoryChange = (value: number | undefined) => {
    setSelectedCategory(value);
    fetchProducts(searchKeyword, value);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>非遗好物</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Search
            placeholder="搜索非遗好物..."
            enterButton={
              <>
                <SearchOutlined /> 搜索
              </>
            }
            size="large"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col>
          <Select
            placeholder="全部分类"
            style={{ width: 160 }}
            size="large"
            allowClear
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Empty description="暂无商品" />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col key={product.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 200,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={product.title}
                        src={product.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/clothing/${product.id}`)}
                >
                  <Card.Meta
                    title={<Text ellipsis>{product.title}</Text>}
                    description={
                      <Text type="danger" strong>
                        ¥{product.price.toFixed(2)}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
