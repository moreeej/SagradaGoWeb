import { useState, useEffect, useCallback } from "react";
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
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";
import Logger from "../../utils/logger";

const { Text, Title } = Typography;
const { Option } = Select;

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [form] = Form.useForm();

  const fetchAnnouncements = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await axios.get(`${API_URL}/getAnnouncements`);
      setAnnouncements(res.data || []);

    } catch (error) {
      console.error(error);
      if (showLoading) {
        message.error("Failed to load announcements");
      }

    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAnnouncements(true);

    const intervalId = setInterval(() => {
      fetchAnnouncements(false);
    }, 5000);

    return () => clearInterval(intervalId);
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
        await Logger.logUpdateAnnouncement(editingData._id, values.title);
        message.success("Announcement updated successfully");

      } else {
        const response = await axios.post(`${API_URL}/admin/createAnnouncement`, payload);
        const newAnnouncement = response.data?.announcement || response.data;
        await Logger.logCreateAnnouncement(newAnnouncement?._id || newAnnouncement?.id, values.title);
        message.success("Announcement created successfully");
      }

      fetchAnnouncements(false);
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
      const announcement = announcements.find(a => a._id === id);
      await axios.delete(`${API_URL}/admin/deleteAnnouncement/${id}`);
      await Logger.logDeleteAnnouncement(id, announcement?.title || "Unknown");
      message.success("Announcement deleted");
      fetchAnnouncements(false);

    } catch (error) {
      console.error(error);
      message.error("Failed to delete announcement");
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (priorityFilter !== "all") {
      const priority = announcement.priority || "normal";
      if (priority !== priorityFilter) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = announcement.title?.toLowerCase().includes(query);
      const contentMatch = announcement.content?.toLowerCase().includes(query);
      const authorMatch = announcement.author?.toLowerCase().includes(query);

      if (!titleMatch && !contentMatch && !authorMatch) {
        return false;
      }
    }

    return true;
  });

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
      width: "30%",
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
            className="border-btn"
            style={{ padding: "15px 14px" }}
            onClick={() => openEdit(record)}
          />

          <Popconfirm
            title="Delete this announcement?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteAnnouncement(record._id)}
          >
            <Button danger className="dangerborder-btn"
              style={{ padding: "15px 14px" }} icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 20 }}>
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Title level={2} style={{ fontFamily: 'Poppins' }}>Announcement Management</Title>

            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
                className="border-btn"
              >
                New Announcement
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>Search Announcements:</Text>
                <Input
                  placeholder="Search by title, content, or author..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  style={{
                    width: '100%',
                    fontFamily: 'Poppins, sans-serif',
                    height: '42px',
                  }}
                />
              </div>

              <div style={{ flex: '0 0 250px' }}>
                <Text strong style={{ fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 8 }}>Filter by Priority:</Text>
                <Select
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  style={{
                    width: '100%',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    height: '42px',
                  }}
                  placeholder="Select priority"
                >
                  <Option value="all">All Priorities</Option>
                  <Option value="normal">Normal</Option>
                  <Option value="important">Important</Option>
                  <Option value="urgent">Urgent</Option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Card>
              <Table
                dataSource={filteredAnnouncements}
                columns={columns}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 600 }}
              />
            </Card>
          )}

          {/* Modal */}
          <Modal
            title={editingData ? "Edit Announcement" : "Create Announcement"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleSubmit}
            okText={editingData ? "Update" : "Create"}
            confirmLoading={saving}
            width={800}
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
        </div>
      </div>
    </div>
  );
}
