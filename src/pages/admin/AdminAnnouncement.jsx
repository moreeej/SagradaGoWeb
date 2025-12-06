import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";

const { Text } = Typography;
const { Option } = Select;

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [form] = Form.useForm();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/getAnnouncements`);
      setAnnouncements(res.data || []);

    } catch (error) {
      console.error(error);
      message.error("Failed to load announcements");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreate = () => {
    setEditingData(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingData(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      priority: record.priority || "normal",
      author: record.author || "Parish Office",
      image: record.image || "",
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        ...values,
        date: new Date().toISOString(), 
      };

      if (editingData) {
        await axios.put(
          `${API_URL}/admin/updateAnnouncement/${editingData._id}`,
          payload
        );
        message.success("Announcement updated successfully");

      } else {
        await axios.post(`${API_URL}/admin/createAnnouncement`, payload);
        message.success("Announcement created successfully");
      }

      fetchAnnouncements();
      setIsModalOpen(false);

    } catch (error) {
      console.error("Announcement save error:", error.response || error);
      message.error("Error saving announcement");

    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/deleteAnnouncement/${id}`);
      message.success("Announcement deleted");
      fetchAnnouncements();
      
    } catch (error) {
      console.error(error);
      message.error("Failed to delete announcement");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      width: "20%",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Content",
      dataIndex: "content",
      width: "45%",
      render: (text) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      width: "10%",
      render: (p) => p || "normal",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      width: "15%",
      render: (date) =>
        date ? new Date(date).toLocaleString() : <i>Unknown</i>,
    },
    {
      title: "Actions",
      width: "10%",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete this announcement?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteAnnouncement(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Announcement Management"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAnnouncements}>
            Refresh
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Announcement
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={announcements}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingData ? "Edit Announcement" : "Create Announcement"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingData ? "Update" : "Create"}
        confirmLoading={saving}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: "Content is required" }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Enter announcement details"
            />
          </Form.Item>

          <Form.Item label="Priority" name="priority">
            <Select>
              <Option value="normal">Normal</Option>
              <Option value="important">Important</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Author" name="author">
            <Input placeholder="Author name" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
