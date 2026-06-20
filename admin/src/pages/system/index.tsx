import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Tabs,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { get, post, put } from "../../api/request";

const { Title } = Typography;

interface ConfigRecord {
  id: number;
  key: string;
  value: string;
  remark: string;
}

interface LogRecord {
  id: number;
  operator: string;
  action: string;
  detail: string;
  createdAt: string;
}

interface ListResponse<T> {
  list: T[];
  total: number;
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("configs");

  // 系统配置状态
  const [configLoading, setConfigLoading] = useState(false);
  const [configs, setConfigs] = useState<ConfigRecord[]>([]);
  const [configTotal, setConfigTotal] = useState(0);
  const [configPage, setConfigPage] = useState(1);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigRecord | null>(null);
  const [configForm] = Form.useForm();

  // 操作日志状态
  const [logLoading, setLogLoading] = useState(false);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);

  const configPageRef = useRef(configPage);
  configPageRef.current = configPage;
  const logPageRef = useRef(logPage);
  logPageRef.current = logPage;

  // ========== 系统配置 ==========
  const fetchConfigs = useCallback(async (p?: number) => {
    const currentPage = p ?? configPageRef.current;
    setConfigLoading(true);
    try {
      const res = await get<ListResponse<ConfigRecord>>("/admin/configs", {
        page: currentPage,
        pageSize: 20,
      });
      setConfigs(res.list || []);
      setConfigTotal(res.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载系统配置失败");
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const handleEditConfig = (record: ConfigRecord) => {
    setEditingConfig(record);
    configForm.setFieldsValue({ value: record.value });
    setConfigModalOpen(true);
  };

  const handleUpdateConfig = async () => {
    try {
      const values = await configForm.validateFields();
      await put("/admin/configs", {
        key: editingConfig?.key,
        value: values.value,
      });
      message.success("更新成功");
      setConfigModalOpen(false);
      setEditingConfig(null);
      configForm.resetFields();
      fetchConfigs(configPageRef.current);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  // ========== 操作日志 ==========
  const fetchLogs = useCallback(async (p?: number) => {
    const currentPage = p ?? logPageRef.current;
    setLogLoading(true);
    try {
      const res = await get<ListResponse<LogRecord>>("/admin/logs", {
        page: currentPage,
        pageSize: 20,
      });
      setLogs(res.list || []);
      setLogTotal(res.total || 0);
    } catch (err: any) {
      // 日志接口可能未实现，静默处理
      setLogs([]);
      setLogTotal(0);
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "configs") {
      fetchConfigs(1);
    } else {
      fetchLogs(1);
    }
  }, [activeTab, fetchConfigs, fetchLogs]);

  const configColumns: ColumnsType<ConfigRecord> = [
    {
      title: "配置键",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "配置值",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEditConfig(record)}>
          编辑
        </Button>
      ),
    },
  ];

  const logColumns: ColumnsType<LogRecord> = [
    {
      title: "操作人",
      dataIndex: "operator",
      key: "operator",
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "详情",
      dataIndex: "detail",
      key: "detail",
      ellipsis: true,
    },
    {
      title: "时间",
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
          系统设置
        </Title>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: "configs",
            label: "系统配置",
            children: (
              <Table
                columns={configColumns}
                dataSource={configs}
                rowKey="id"
                loading={configLoading}
                pagination={{
                  current: configPage,
                  total: configTotal,
                  pageSize: 20,
                  onChange: (p) => {
                    setConfigPage(p);
                    fetchConfigs(p);
                  },
                }}
              />
            ),
          },
          {
            key: "logs",
            label: "操作日志",
            children: (
              <Table
                columns={logColumns}
                dataSource={logs}
                rowKey="id"
                loading={logLoading}
                pagination={{
                  current: logPage,
                  total: logTotal,
                  pageSize: 20,
                  onChange: (p) => {
                    setLogPage(p);
                    fetchLogs(p);
                  },
                }}
              />
            ),
          },
        ]}
      />

      {/* 编辑配置弹窗 */}
      <Modal
        title={`编辑配置 - ${editingConfig?.key || ""}`}
        open={configModalOpen}
        onOk={handleUpdateConfig}
        onCancel={() => {
          setConfigModalOpen(false);
          setEditingConfig(null);
          configForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={configForm} layout="vertical">
          <Form.Item
            name="value"
            label="配置值"
            rules={[{ required: true, message: "请输入配置值" }]}
          >
            <Input placeholder="请输入配置值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
