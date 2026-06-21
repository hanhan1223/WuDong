import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Tabs,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { get, post } from "../../api/request";

const { Title } = Typography;
const { TextArea } = Input;

interface AnnouncementRecord {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface BannerRecord {
  id: number;
  title: string;
  imageUrl: string;
  module: string;
  sort: number;
  status: string;
  createdAt: string;
}

interface ListResponse<T> {
  list: T[];
  total: number;
}

const bannerStatusMap: Record<string, { color: string; text: string }> = {
  ACTIVE: { color: "green", text: "启用" },
  DISABLED: { color: "default", text: "禁用" },
};

export default function ContentManage() {
  const [activeTab, setActiveTab] = useState("announcements");

  // 公告状态
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [announcementTotal, setAnnouncementTotal] = useState(0);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementForm] = Form.useForm();

  // 轮播图状态
  const [bannerLoading, setBannerLoading] = useState(false);
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [bannerTotal, setBannerTotal] = useState(0);
  const [bannerPage, setBannerPage] = useState(1);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerForm] = Form.useForm();

  const announcementPageRef = useRef(announcementPage);
  announcementPageRef.current = announcementPage;
  const bannerPageRef = useRef(bannerPage);
  bannerPageRef.current = bannerPage;

  // ========== 公告 ==========
  const fetchAnnouncements = useCallback(async (p?: number) => {
    const currentPage = p ?? announcementPageRef.current;
    setAnnouncementLoading(true);
    try {
      const res = await get<ListResponse<AnnouncementRecord>>(
        "/admin/announcements",
        {
          page: currentPage,
          pageSize: 20,
        },
      );
      const data = Array.isArray(res) ? res : res?.list || [];
      setAnnouncements(data);
      setAnnouncementTotal(Array.isArray(res) ? data.length : res?.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载公告列表失败");
    } finally {
      setAnnouncementLoading(false);
    }
  }, []);

  const handleCreateAnnouncement = async () => {
    try {
      const values = await announcementForm.validateFields();
      await post("/admin/announcements", values);
      message.success("创建成功");
      setAnnouncementModalOpen(false);
      announcementForm.resetFields();
      fetchAnnouncements(1);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  // ========== 轮播图 ==========
  const fetchBanners = useCallback(async (p?: number) => {
    const currentPage = p ?? bannerPageRef.current;
    setBannerLoading(true);
    try {
      const res = await get<ListResponse<BannerRecord>>("/admin/banners", {
        page: currentPage,
        pageSize: 20,
      });
      const data = Array.isArray(res) ? res : res?.list || [];
      setBanners(data);
      setBannerTotal(Array.isArray(res) ? data.length : res?.total || 0);
    } catch (err: any) {
      message.error(err?.message || "加载轮播图列表失败");
    } finally {
      setBannerLoading(false);
    }
  }, []);

  const handleCreateBanner = async () => {
    try {
      const values = await bannerForm.validateFields();
      await post("/admin/banners", values);
      message.success("创建成功");
      setBannerModalOpen(false);
      bannerForm.resetFields();
      fetchBanners(1);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "announcements") {
      fetchAnnouncements(1);
    } else {
      fetchBanners(1);
    }
  }, [activeTab, fetchAnnouncements, fetchBanners]);

  const announcementColumns: ColumnsType<AnnouncementRecord> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time) => new Date(time).toLocaleString("zh-CN"),
    },
  ];

  const bannerColumns: ColumnsType<BannerRecord> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "图片",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="banner"
            style={{
              width: 80,
              height: 45,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "模块",
      dataIndex: "module",
      key: "module",
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const s = bannerStatusMap[status] || { color: "default", text: status };
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
          内容运营
        </Title>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: "announcements",
            label: "公告管理",
            children: (
              <>
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAnnouncementModalOpen(true)}
                  >
                    新建公告
                  </Button>
                </div>
                <Table
                  columns={announcementColumns}
                  dataSource={announcements}
                  rowKey="id"
                  loading={announcementLoading}
                  pagination={{
                    current: announcementPage,
                    total: announcementTotal,
                    pageSize: 20,
                    onChange: (p) => {
                      setAnnouncementPage(p);
                      fetchAnnouncements(p);
                    },
                  }}
                />
              </>
            ),
          },
          {
            key: "banners",
            label: "轮播图管理",
            children: (
              <>
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setBannerModalOpen(true)}
                  >
                    新建轮播图
                  </Button>
                </div>
                <Table
                  columns={bannerColumns}
                  dataSource={banners}
                  rowKey="id"
                  loading={bannerLoading}
                  pagination={{
                    current: bannerPage,
                    total: bannerTotal,
                    pageSize: 20,
                    onChange: (p) => {
                      setBannerPage(p);
                      fetchBanners(p);
                    },
                  }}
                />
              </>
            ),
          },
        ]}
      />

      {/* 新建公告弹窗 */}
      <Modal
        title="新建公告"
        open={announcementModalOpen}
        onOk={handleCreateAnnouncement}
        onCancel={() => {
          setAnnouncementModalOpen(false);
          announcementForm.resetFields();
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={announcementForm} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: "请输入内容" }]}
          >
            <TextArea rows={4} placeholder="请输入公告内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建轮播图弹窗 */}
      <Modal
        title="新建轮播图"
        open={bannerModalOpen}
        onOk={handleCreateBanner}
        onCancel={() => {
          setBannerModalOpen(false);
          bannerForm.resetFields();
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={bannerForm} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input placeholder="请输入轮播图标题" />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="图片链接"
            rules={[{ required: true, message: "请输入图片链接" }]}
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item
            name="module"
            label="所属模块"
            rules={[{ required: true, message: "请输入所属模块" }]}
          >
            <Input placeholder="请输入所属模块" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="请输入排序值"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
