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
  Modal,
  Radio,
} from "antd";
import { SearchOutlined, ShopOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { get, post } from "../../api/request";

const { Title } = Typography;

interface MerchantRecord {
  id: number;
  shopName: string;
  contactName: string;
  contactPhone: string;
  module: string;
  status: string;
  createdAt: string;
  avatar?: string;
}

interface MerchantListResponse {
  list: MerchantRecord[];
  total: number;
}

const moduleMap: Record<string, { color: string; text: string }> = {
  CLOTHING: { color: "blue", text: "衣" },
  DINING: { color: "orange", text: "食" },
  ACCOMMODATION: { color: "green", text: "住" },
  TRAVEL: { color: "purple", text: "行" },
};

const statusMap: Record<string, { color: string; text: string }> = {
  PENDING: { color: "orange", text: "待审核" },
  APPROVED: { color: "green", text: "已通过" },
  REJECTED: { color: "red", text: "已驳回" },
  DISABLED: { color: "default", text: "已禁用" },
};

export default function MerchantList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MerchantRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<MerchantRecord | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">(
    "APPROVED",
  );

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
      const res = await get<MerchantListResponse>("/admin/merchants", {
        page: currentPage,
        pageSize: 20,
        keyword: currentSearch,
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载商家列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "");
  }, [fetchData]);

  const openReviewModal = (
    record: MerchantRecord,
    action: "APPROVED" | "REJECTED",
  ) => {
    setReviewTarget(record);
    setReviewAction(action);
    setReviewModalVisible(true);
  };

  const handleReview = async () => {
    if (!reviewTarget) return;
    try {
      await post(`/admin/merchants/${reviewTarget.id}/review`, {
        action: reviewAction,
      });
      message.success(reviewAction === "APPROVED" ? "审核通过" : "已驳回");
      setReviewModalVisible(false);
      setReviewTarget(null);
      fetchData(pageRef.current, keywordRef.current);
    } catch (err: any) {
      message.error(err?.message || "操作失败");
    }
  };

  const columns: ColumnsType<MerchantRecord> = [
    {
      title: "商家名称",
      dataIndex: "shopName",
      key: "shopName",
      render: (name, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<ShopOutlined />} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: "联系人",
      dataIndex: "contactName",
      key: "contactName",
    },
    {
      title: "联系电话",
      dataIndex: "contactPhone",
      key: "contactPhone",
    },
    {
      title: "所属模块",
      dataIndex: "module",
      key: "module",
      render: (module) => {
        const m = moduleMap[module] || { color: "default", text: module };
        return <Tag color={m.color}>{m.text}</Tag>;
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
      render: (_, record) => {
        if (record.status === "PENDING") {
          return (
            <Space>
              <Popconfirm
                title="确定通过该商家审核？"
                onConfirm={() => openReviewModal(record, "APPROVED")}
              >
                <Button type="link">审核</Button>
              </Popconfirm>
            </Space>
          );
        }
        return null;
      },
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
          商家管理
        </Title>
        <Space>
          <Input
            placeholder="搜索商家名称/联系人"
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
      <Modal
        title="商家审核"
        open={reviewModalVisible}
        onOk={handleReview}
        onCancel={() => {
          setReviewModalVisible(false);
          setReviewTarget(null);
        }}
        okText="确认"
        cancelText="取消"
      >
        <p>确定将商家「{reviewTarget?.shopName}」标记为：</p>
        <Radio.Group
          value={reviewAction}
          onChange={(e) => setReviewAction(e.target.value)}
        >
          <Radio value="APPROVED">通过</Radio>
          <Radio value="REJECTED">驳回</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
}
