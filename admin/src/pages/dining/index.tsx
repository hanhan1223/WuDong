import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Input, Tag, Space, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { get } from "../../api/request";

const { Title } = Typography;

interface RestaurantRecord {
  id: number;
  name: string;
  address: string;
  capacity: number;
  rating: number;
  status: string;
  createdAt: string;
}

interface RestaurantListResponse {
  list: RestaurantRecord[];
  total: number;
}

const statusMap: Record<string, { color: string; text: string }> = {
  ACTIVE: { color: "green", text: "营业中" },
  INACTIVE: { color: "red", text: "已下架" },
};

export default function DiningList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RestaurantRecord[]>([]);
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
      const res = await get<RestaurantListResponse>("/restaurants", {
        page: currentPage,
        pageSize: 20,
        keyword: currentSearch,
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载餐饮列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const columns: ColumnsType<RestaurantRecord> = [
    {
      title: "餐厅名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "地址",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "容量",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "评分",
      dataIndex: "rating",
      key: "rating",
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
          餐饮管理
        </Title>
        <Space>
          <Input
            placeholder="搜索餐厅名称"
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
