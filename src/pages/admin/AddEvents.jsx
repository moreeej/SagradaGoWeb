import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  message,
  Typography,
  Row,
  Col,
  Space,
  Table,
  Tag,
  Popconfirm,
  Image,
  Select,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function AddEvents() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locations, setLocations] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/getAllLocations`);
      setLocations(response.data.locations || []);

    } catch (error) {
      console.error("Error fetching locations:", error);
      message.error("Failed to fetch locations");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getAllEvents`);
      setEvents(response.data.events || []);

    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to fetch events. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("date", values.date.format("YYYY-MM-DD"));
      formData.append("location", values.location);

      if (values.description) {
        formData.append("description", values.description);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingEvent) {
        formData.append("eventId", editingEvent._id);
        await axios.put(`${API_URL}/admin/updateEvent`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Event updated successfully!");

      } else {
        await axios.post(`${API_URL}/admin/createEvent`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Event created successfully!");
      }

      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
      setEditingEvent(null);
      fetchEvents();

    } catch (error) {
      console.error("Error saving event:", error);
      message.error(error.response?.data?.message || "Failed to save event. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      title: event.title,
      date: event.date ? dayjs(event.date) : null,
      location: event.location,
      description: event.description || "",
    });

    if (event.image) {
      setImagePreview(event.image);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/admin/deleteEvent/${eventId}`);
      message.success("Event deleted successfully!");
      fetchEvents();

    } catch (error) {
      console.error("Error deleting event:", error);
      message.error("Failed to delete event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setEditingEvent(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("MMMM DD, YYYY");
  };

  const isEventPast = (dateString) => {
    if (!dateString) return false;
    const eventDate = dayjs(dateString).startOf("day");
    const today = dayjs().startOf("day");
    return eventDate.isBefore(today);
  };

  const getEventStatus = (dateString) => {
    if (!dateString) return { status: "unknown", color: "default", text: "Unknown" };
    const isPast = isEventPast(dateString);
    return isPast
      ? { status: "past", color: "default", text: "Past" }
      : { status: "upcoming", color: "green", text: "Upcoming" };
  };

  const getMonthOptions = () => {
    const months = [
      { value: "all", label: "All Months" },
      { value: "0", label: "January" },
      { value: "1", label: "February" },
      { value: "2", label: "March" },
      { value: "3", label: "April" },
      { value: "4", label: "May" },
      { value: "5", label: "June" },
      { value: "6", label: "July" },
      { value: "7", label: "August" },
      { value: "8", label: "September" },
      { value: "9", label: "October" },
      { value: "10", label: "November" },
      { value: "11", label: "December" },
    ];
    return months;
  };

  const filteredEvents = events.filter((event) => {
    if (!event.date) return false;

    const eventDate = dayjs(event.date).startOf("day");
    const today = dayjs().startOf("day");

    if (dateFilter === "upcoming") {
      if (eventDate.isBefore(today)) return false;

    } else if (dateFilter === "past") {
      if (!eventDate.isBefore(today)) return false;
    }

    if (monthFilter !== "all") {
      const eventMonth = eventDate.month();
      if (eventMonth !== parseInt(monthFilter)) return false;
    }

    return true;
  });

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image) => (
        <Image
          src={image || "/no-image.jpg"}
          alt="Event"
          width={80}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="/no-image.jpg"
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
      sorter: (a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return dayjs(a.date).unix() - dayjs(b.date).unix();
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const statusInfo = getEventStatus(record.date);
        return (
          <Tag color={statusInfo.color} icon={statusInfo.status === "upcoming" ? <CalendarOutlined /> : null}>
            {statusInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: "Upcoming", value: "upcoming" },
        { text: "Past", value: "past" },
      ],
      onFilter: (value, record) => {
        const statusInfo = getEventStatus(record.date);
        return statusInfo.status === value;
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this event?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1550px", margin: "0 auto", marginTop: 20 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: "#262626", fontFamily: 'Poppins' }}>
            {editingEvent ? "Edit Event" : "Add New Event"}
          </Title>
          <Text type="secondary" style={{ fontSize: 16, fontFamily: 'Poppins' }}>
            {editingEvent
              ? "Update event information"
              : "Create and manage parish events"}
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Form Section */}
          <Col xs={24} lg={10}>
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  name="title"
                  label="Event Title"
                  rules={[
                    { required: true, message: "Please enter event title" },
                  ]}
                >
                  <Input
                    placeholder="e.g., Tree Planting Activity"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="date"
                  label="Event Date"
                  rules={[{ required: true, message: "Please select event date" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: "Please select event location" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select location"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {locations.map((loc) => (
                      <Select.Option key={loc} value={loc}>
                        {loc}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <TextArea
                    rows={4}
                    placeholder="Event description (optional)"
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="Event Image">
                  <Upload
                    name="image"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleImageChange}
                    accept="image/*"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                  {imageFile && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {imageFile.name || "Image selected"}
                      </Text>
                    </div>
                  )}
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={loading}
                      icon={<PlusOutlined />}
                      className="border-btn"
                    >
                      {editingEvent ? "Update Event" : "Create Event"}
                    </Button>
                    {editingEvent && (
                      <Button size="large" onClick={handleCancel}>
                        Cancel
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Events List Section */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>All Events ({filteredEvents.length})</span>
                </Space>
              }
              extra={
                <Button
                  icon={<UploadOutlined />}
                  onClick={fetchEvents}
                  loading={loading}
                  className="border-btn"
                  style={{ padding: 12 }}
                >
                  Refresh
                </Button>
              }
            >
              <Space style={{ marginBottom: 16, width: "100%", display: "flex", flexWrap: "wrap" }}>
                <Text strong>Filter by Date:</Text>
                <Select
                  value={dateFilter}
                  onChange={setDateFilter}
                  style={{ width: 150 }}
                >
                  <Option value="all">All Events</Option>
                  <Option value="upcoming">Upcoming</Option>
                  <Option value="past">Past</Option>
                </Select>

                <Text strong style={{ marginLeft: 16 }}>Filter by Month:</Text>
                <Select
                  value={monthFilter}
                  onChange={setMonthFilter}
                  style={{ width: 150 }}
                >
                  {getMonthOptions().map((month) => (
                    <Option key={month.value} value={month.value}>
                      {month.label}
                    </Option>
                  ))}
                </Select>
              </Space>

              <Table
                columns={columns}
                dataSource={filteredEvents}
                rowKey="_id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: "No events found. Create your first event!",
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

