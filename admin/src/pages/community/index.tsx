import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Input, Tag, Space, Typography, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { get, post } from "../../api/request";

const { Title } = Typography;

interface CommunityRecord {
  id: number;
  title: string;
  user: { nickname: string };
  likeCount: number;
  commentCount: number;
  viewCount: number;
  status: string;
  createdAt: string;
}

interface CommunityListResponse {
  list: CommunityRecord[];
  total: number;
}

const statusMap: Record<string, { color: string; text: string }> = {
  UNDER_REVIEW: { color: "orange", text: "审核中" },
  NORMAL: { color: "green", text: "正常" },
  REJECTED: { color: "red", text: "未通过" },
  OFF_SHELF: { color: "default", text: "已下架" },
};

export default function CommunityList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CommunityRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const pageRef = useRef(page);
  const keywordRef = useRef(keyword);
  pageRef.current = page;
  keywordRef.current = keyword;

  const fetchData = useCallback(async (p?: number, search?: string) => {
    const currentPage = p ?? pageRef.current;
    const currentSearch = search ?? keywordRef.current;
    setLoading(true);
    try {
      const res = await get<CommunityListResponse>("/posts", {
        page: currentPage,
        pageSize: 20,
        keyword: currentSearch,
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载社区列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const columns: ColumnsType<CommunityRecord> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "作者",
      key: "author",
      render: (_, record) => record.user?.nickname || "-",
    },
    {
      title: "点赞数",
      dataIndex: "likeCount",
      key: "likeCount",
    },
    {
      title: "评论数",
      dataIndex: "commentCount",
      key: "commentCount",
    },
    {
      title: "浏览数",
      dataIndex: "viewCount",
      key: "viewCount",
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
          社区管理
        </Title>
        <Space>
          <Input
            placeholder="搜索关键词"
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
