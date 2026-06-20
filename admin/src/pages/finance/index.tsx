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

interface FinanceRecord {
  id: number;
  merchant: { shopName: string };
  orderAmount: number;
  commission: number;
  merchantIncome: number;
  status: string;
  createdAt: string;
}

interface FinanceListResponse {
  list: FinanceRecord[];
  total: number;
}

const statusMap: Record<string, { color: string; text: string }> = {
  PENDING: { color: "orange", text: "待结算" },
  SETTLED: { color: "green", text: "已结算" },
};

export default function FinanceList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FinanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const pageRef = useRef(page);
  const statusRef = useRef(statusFilter);
  pageRef.current = page;
  statusRef.current = statusFilter;

  const fetchData = useCallback(async (p?: number, status?: string) => {
    const currentPage = p ?? pageRef.current;
    const currentStatus = status ?? statusRef.current;
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize: 20,
      };
      if (currentStatus) {
        params.status = currentStatus;
      }
      const res = await get<FinanceListResponse>(
        "/admin/finance/records",
        params,
      );
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载财务记录失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const handleSettle = async (id: number) => {
    try {
      await post(`/admin/finance/${id}/settle`);
      message.success("结算成功");
      fetchData(pageRef.current, statusRef.current);
    } catch (err: any) {
      message.error(err?.message || "结算失败");
    }
  };

  const columns: ColumnsType<FinanceRecord> = [
    {
      title: "商家",
      key: "merchant",
      render: (_, record) => record.merchant?.shopName || "-",
    },
    {
      title: "订单金额",
      dataIndex: "orderAmount",
      key: "orderAmount",
      render: (amount) => `¥${Number(amount).toFixed(2)}`,
    },
    {
      title: "平台佣金",
      dataIndex: "commission",
      key: "commission",
      render: (amount) => `¥${Number(amount).toFixed(2)}`,
    },
    {
      title: "商家收入",
      dataIndex: "merchantIncome",
      key: "merchantIncome",
      render: (amount) => `¥${Number(amount).toFixed(2)}`,
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
    {
      title: "操作",
      key: "action",
      render: (_, record) =>
        record.status === "PENDING" ? (
          <Popconfirm
            title="确定结算该笔记录？"
            onConfirm={() => handleSettle(record.id)}
          >
            <Button type="link">结算</Button>
          </Popconfirm>
        ) : null,
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
          财务结算
        </Title>
        <Space>
          <Button
            type={statusFilter === "" ? "primary" : "default"}
            onClick={() => {
              setStatusFilter("");
              setPage(1);
              fetchData(1, "");
            }}
          >
            全部
          </Button>
          <Button
            type={statusFilter === "PENDING" ? "primary" : "default"}
            onClick={() => {
              setStatusFilter("PENDING");
              setPage(1);
              fetchData(1, "PENDING");
            }}
          >
            待结算
          </Button>
          <Button
            type={statusFilter === "SETTLED" ? "primary" : "default"}
            onClick={() => {
              setStatusFilter("SETTLED");
              setPage(1);
              fetchData(1, "SETTLED");
            }}
          >
            已结算
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
