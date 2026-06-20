import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Select, Tag, Space, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { get } from "../../api/request";
import OrderStatusTag from "../../components/OrderStatusTag";

const { Title } = Typography;

interface OrderRecord {
  id: number;
  orderNo: string;
  user: { nickname: string };
  orderType: string;
  module: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface OrderListResponse {
  list: OrderRecord[];
  total: number;
}

const orderTypeMap: Record<string, string> = {
  PRODUCT: "商品订单",
  TABLE_BOOKING: "餐位预订",
  ACCOMMODATION: "住宿预订",
  TICKET: "门票订单",
  ROUTE: "路线订单",
};

const moduleMap: Record<string, string> = {
  CLOTHING: "衣",
  DINING: "食",
  ACCOMMODATION: "住",
  TRAVEL: "行",
};

export default function OrderList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [orderType, setOrderType] = useState<string | undefined>(undefined);

  // 使用 ref 保存当前 page、status 和 orderType，避免 stale closure
  const pageRef = useRef(page);
  const statusRef = useRef(status);
  const orderTypeRef = useRef(orderType);
  pageRef.current = page;
  statusRef.current = status;
  orderTypeRef.current = orderType;

  const fetchData = useCallback(
    async (p?: number, s?: string | undefined, t?: string | undefined) => {
      const currentPage = p ?? pageRef.current;
      const currentStatus = s !== undefined ? s : statusRef.current;
      const currentOrderType = t !== undefined ? t : orderTypeRef.current;
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          pageSize: 20,
        };
        if (currentStatus) params.status = currentStatus;
        if (currentOrderType) params.orderType = currentOrderType;
        const res = await get<OrderListResponse>("/admin/orders", params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } catch (err: any) {
        message.error(err?.message || "加载订单列表失败");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(1, undefined, undefined);
  }, [fetchData]);

  const columns: ColumnsType<OrderRecord> = [
    {
      title: "订单号",
      dataIndex: "orderNo",
      key: "orderNo",
    },
    {
      title: "用户",
      key: "user",
      render: (_, record) => <span>{record.user?.nickname || "-"}</span>,
    },
    {
      title: "订单类型",
      dataIndex: "orderType",
      key: "orderType",
      render: (type) => {
        const text = orderTypeMap[type] || type;
        return <Tag>{text}</Tag>;
      },
    },
    {
      title: "模块",
      dataIndex: "module",
      key: "module",
      render: (mod) => {
        const text = moduleMap[mod] || mod;
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: "金额",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <span>¥{Number(amount).toFixed(2)}</span>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (statusVal) => <OrderStatusTag status={statusVal} />,
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
          订单管理
        </Title>
        <Space>
          <Select
            placeholder="订单类型"
            allowClear
            value={orderType}
            onChange={(val) => {
              setOrderType(val);
              setPage(1);
              fetchData(1, status, val);
            }}
            style={{ width: 150 }}
            options={Object.entries(orderTypeMap).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Select
            placeholder="订单状态"
            allowClear
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
              fetchData(1, val, orderType);
            }}
            style={{ width: 150 }}
            options={[
              { value: "PENDING_PAYMENT", label: "待支付" },
              { value: "PAID", label: "已支付" },
              { value: "CONFIRMED", label: "已确认" },
              { value: "IN_PROGRESS", label: "进行中" },
              { value: "COMPLETED", label: "已完成" },
              { value: "CANCELLED", label: "已取消" },
              { value: "REFUNDING", label: "退款中" },
              { value: "REFUNDED", label: "已退款" },
            ]}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              fetchData(1, status, orderType);
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
