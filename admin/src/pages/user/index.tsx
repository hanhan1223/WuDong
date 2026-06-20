import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Avatar,
  message,
  Popconfirm,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { get, post } from "../../api/request";

const { Title } = Typography;

interface UserRecord {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
}

interface UserListResponse {
  list: UserRecord[];
  total: number;
}

const roleMap: Record<string, { color: string; text: string }> = {
  TOURIST: { color: "blue", text: "游客" },
  MERCHANT: { color: "orange", text: "商家" },
  ADMIN: { color: "red", text: "管理员" },
};

const statusMap: Record<string, { color: string; text: string }> = {
  ACTIVE: { color: "green", text: "正常" },
  DISABLED: { color: "default", text: "禁用" },
  MUTED: { color: "orange", text: "禁言" },
};

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserRecord[]>([]);
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
      const res = await get<UserListResponse>("/admin/users", {
        page: currentPage,
        pageSize: 20,
        keyword: currentSearch,
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载用户列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  /** 根据当前状态确定切换目标状态 */
  const getNextStatus = (current: string) => {
    switch (current) {
      case "ACTIVE":
        return "DISABLED";
      case "DISABLED":
        return "ACTIVE";
      case "MUTED":
        return "ACTIVE"; // 解除禁言
      default:
        return "ACTIVE";
    }
  };

  /** 获取操作按钮文本 */
  const getToggleLabel = (current: string) => {
    switch (current) {
      case "ACTIVE":
        return "禁用";
      case "DISABLED":
        return "启用";
      case "MUTED":
        return "解除禁言";
      default:
        return "启用";
    }
  };

  const handleToggleStatus = async (id: number, status: string) => {
    try {
      await post(`/admin/users/${id}/status`, {
        status: getNextStatus(status),
      });
      message.success("操作成功");
      fetchData(pageRef.current, keywordRef.current);
    } catch (err: any) {
      message.error(err?.message || "操作失败");
    }
  };

  const columns: ColumnsType<UserRecord> = [
    {
      title: "用户",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <span>{record.nickname}</span>
        </Space>
      ),
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const r = roleMap[role] || { color: "default", text: role };
        return <Tag color={r.color}>{r.text}</Tag>;
      },
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
      title: "注册时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time) => new Date(time).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title={`确定${getToggleLabel(record.status)}该用户？`}
          onConfirm={() => handleToggleStatus(record.id, record.status)}
        >
          <Button type="link" danger={record.status === "ACTIVE"}>
            {getToggleLabel(record.status)}
          </Button>
        </Popconfirm>
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
          用户管理
        </Title>
        <Space>
          <Input
            placeholder="搜索手机号/昵称"
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
