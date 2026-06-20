import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { get, post } from "../../api/request";

const { Title } = Typography;

interface PostRecord {
  id: number;
  title: string;
  author: {
    nickname: string;
  };
  status: string;
  createdAt: string;
}

interface PostListResponse {
  list: PostRecord[];
  total: number;
}

const statusMap: Record<string, { color: string; text: string }> = {
  UNDER_REVIEW: { color: "orange", text: "待审核" },
  NORMAL: { color: "green", text: "已通过" },
  REJECTED: { color: "red", text: "已拒绝" },
};

export default function ModerationList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PostRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const pageRef = useRef(page);
  pageRef.current = page;

  const fetchData = useCallback(async (p?: number) => {
    const currentPage = p ?? pageRef.current;
    setLoading(true);
    try {
      const res = await get<PostListResponse>("/posts", {
        page: currentPage,
        pageSize: 20,
        status: "UNDER_REVIEW",
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载审核列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await post(`/posts/${id}/status`, { status });
      message.success("操作成功");
      fetchData(pageRef.current);
    } catch (err: any) {
      message.error(err?.message || "操作失败");
    }
  };

  const columns: ColumnsType<PostRecord> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "作者",
      key: "author",
      render: (_, record) => record.author?.nickname || "-",
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
      title: "发布时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time) => new Date(time).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定通过该内容？"
            onConfirm={() => handleStatusChange(record.id, "NORMAL")}
          >
            <Button type="link">通过</Button>
          </Popconfirm>
          <Popconfirm
            title="确定拒绝该内容？"
            onConfirm={() => handleStatusChange(record.id, "REJECTED")}
          >
            <Button type="link" danger>
              拒绝
            </Button>
          </Popconfirm>
        </Space>
      ),
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
          内容审核
        </Title>
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
