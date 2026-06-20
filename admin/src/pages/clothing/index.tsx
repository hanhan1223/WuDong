import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Input, Tag, Space, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { get } from "../../api/request";

const { Title } = Typography;

interface ProductRecord {
  id: number;
  title: string;
  category: { name: string };
  price: number;
  stock: number;
  sales: number;
  status: string;
  createdAt: string;
}

interface ProductListResponse {
  list: ProductRecord[];
  total: number;
}

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: "default", text: "草稿" },
  ACTIVE: { color: "green", text: "已上架" },
  INACTIVE: { color: "red", text: "已下架" },
};

export default function ClothingList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  // 使用 ref 保存当前 page 和 keyword，避免 stale closure
  const pageRef = useRef(page);
  const keywordRef = useRef(keyword);
  pageRef.current = page;
  keywordRef.current = keyword;

  const fetchData = useCallback(async (p?: number, search?: string) => {
    const currentPage = p ?? pageRef.current;
    const currentSearch = search ?? keywordRef.current;
    setLoading(true);
    try {
      const res = await get<ProductListResponse>("/products", {
        page: currentPage,
        pageSize: 20,
        keyword: currentSearch,
        status: "ALL",
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载商品列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const columns: ColumnsType<ProductRecord> = [
    {
      title: "商品名称",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "分类",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      render: (price) => `¥${price}`,
    },
    {
      title: "库存",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "销量",
      dataIndex: "sales",
      key: "sales",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const s = statusMap[status] || { color: "default", text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time) => new Date(time).toLocaleString("zh-CN"),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          商品管理
        </Title>
        <Space>
          <Input
            placeholder="搜索商品名称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchData(1, keyword);
            }}
            style={{ width: 240 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              fetchData(1, keyword);
            }}
          >
            搜索
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => {
            setPage(p);
            fetchData(p);
          },
        }}
      />
    </div>
  );
}
