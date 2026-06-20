import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Select,
  Modal,
  Input,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { get, post } from "../../api/request";

const { Title } = Typography;
const { TextArea } = Input;

interface ReportRecord {
  id: number;
  reporter: {
    nickname: string;
  };
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface ReportListResponse {
  list: ReportRecord[];
  total: number;
}

const statusMap: Record<string, { color: string; text: string }> = {
  PENDING: { color: "orange", text: "待处理" },
  HANDLED: { color: "green", text: "已处理" },
  REJECTED: { color: "default", text: "已驳回" },
};

const statusOptions = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待处理" },
  { value: "HANDLED", label: "已处理" },
  { value: "REJECTED", label: "已驳回" },
];

export default function ReportList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [result, setResult] = useState("");

  const pageRef = useRef(page);
  const statusFilterRef = useRef(statusFilter);
  pageRef.current = page;
  statusFilterRef.current = statusFilter;

  const fetchData = useCallback(async (p?: number, status?: string) => {
    const currentPage = p ?? pageRef.current;
    const currentStatus = status ?? statusFilterRef.current;
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize: 20,
      };
      if (currentStatus) {
        params.status = currentStatus;
      }
      const res = await get<ReportListResponse>("/admin/reports", params);
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载举报列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const handleOpenModal = (id: number) => {
    setCurrentId(id);
    setResult("");
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!currentId) return;
    try {
      await post(`/admin/reports/${currentId}/handle`, { result });
      message.success("处理成功");
      setModalVisible(false);
      fetchData(pageRef.current, statusFilterRef.current);
    } catch (err: any) {
      message.error(err?.message || "处理失败");
    }
  };

  const columns: ColumnsType<ReportRecord> = [
    {
      title: "举报人",
      key: "reporter",
      render: (_, record) => record.reporter?.nickname || "-",
    },
    {
      title: "举报类型",
      dataIndex: "targetType",
      key: "targetType",
    },
    {
      title: "目标ID",
      dataIndex: "targetId",
      key: "targetId",
    },
    {
      title: "举报原因",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
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
      title: "举报时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time) => new Date(time).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) =>
        record.status === "PENDING" ? (
          <Button type="link" onClick={() => handleOpenModal(record.id)}>
            处理
          </Button>
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
          举报管理
        </Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
              fetchData(1, val);
            }}
            options={statusOptions}
            style={{ width: 140 }}
          />
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
      <Modal
        title="处理举报"
        open={modalVisible}
        onOk={handleConfirm}
        onCancel={() => setModalVisible(false)}
        okText="确认处理"
        cancelText="取消"
      >
        <TextArea
          rows={4}
          placeholder="请输入处理结果"
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />
      </Modal>
    </div>
  );
}
