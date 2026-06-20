import React, { useState, useEffect } from "react";
import {
  Typography,
  List,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  Popconfirm,
  Spin,
  Empty,
  Space,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { get, post, put, del } from "@/api/request";

const { Title, Text } = Typography;

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await get<{ list: Address[] }>("/api/addresses");
      setAddresses(res.list || []);
    } catch {
      message.error("获取地址列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    form.setFieldsValue(addr);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await put(`/api/addresses/${editingId}`, values);
        message.success("地址已更新");
      } else {
        await post("/api/addresses", values);
        message.success("地址已添加");
      }
      setModalVisible(false);
      fetchAddresses();
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await del(`/api/addresses/${id}`);
      message.success("地址已删除");
      fetchAddresses();
    } catch {
      message.error("删除失败");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await put(`/api/addresses/${id}/default`);
      message.success("已设为默认地址");
      fetchAddresses();
    } catch {
      message.error("设置失败");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          收货地址
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
          新增地址
        </Button>
      </div>

      <Spin spinning={loading}>
        {addresses.length === 0 && !loading ? (
          <Empty description="暂无收货地址" />
        ) : (
          <List
            dataSource={addresses}
            renderItem={(addr) => (
              <List.Item
                actions={[
                  !addr.isDefault && (
                    <Button
                      type="link"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      设为默认
                    </Button>
                  ),
                  <Button type="link" onClick={() => handleOpenEdit(addr)}>
                    编辑
                  </Button>,
                  <Popconfirm
                    title="确定删除该地址？"
                    onConfirm={() => handleDelete(addr.id)}
                  >
                    <Button type="link" danger>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{addr.name}</Text>
                      <Text>{addr.phone}</Text>
                      {addr.isDefault && <Tag color="red">默认</Tag>}
                    </Space>
                  }
                  description={`${addr.province}${addr.city}${addr.district}${addr.detail}`}
                />
              </List.Item>
            )}
          />
        )}
      </Spin>

      <Modal
        title={editingId ? "编辑地址" : "新增地址"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="收货人"
            rules={[{ required: true, message: "请输入收货人姓名" }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: "请输入手机号" }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: "请输入省份" }]}
          >
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: "请输入城市" }]}
          >
            <Input placeholder="请输入城市" />
          </Form.Item>
          <Form.Item
            name="district"
            label="区/县"
            rules={[{ required: true, message: "请输入区/县" }]}
          >
            <Input placeholder="请输入区/县" />
          </Form.Item>
          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: "请输入详细地址" }]}
          >
            <Input.TextArea rows={2} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="isDefault" label="设为默认" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
