import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
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
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  SearchOutlined,
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchLocations();

    const interval = setInterval(() => {
      fetchEvents(true);
    }, 5000);

    return () => clearInterval(interval);
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

  const fetchEvents = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await axios.get(`${API_URL}/getAllEvents`);
      setEvents(response.data.events || []);

    } catch (error) {
      console.error("Error fetching events:", error);
      if (!silent) {
        message.error("Failed to fetch events. Please try again.");
      }

    } finally {
      if (!silent) {
        setLoading(false);
      }
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
      formData.append("type", values.type || "event");
      formData.append("date", values.date.format("YYYY-MM-DD"));
      formData.append("time_start", values.time_start ? values.time_start.format("HH:mm") : "");
      formData.append("time_end", values.time_end ? values.time_end.format("HH:mm") : "");
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
      type: event.type || "event",
      title: event.title,
      date: event.date ? dayjs(event.date) : null,
      time_start: event.time_start ? dayjs(event.time_start, "HH:mm") : null,
      time_end: event.time_end ? dayjs(event.time_end, "HH:mm") : null,
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
    return dayjs(dateString).format("MMM DD, YYYY");
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

    if (typeFilter !== "all") {
      if (event.type !== typeFilter) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = event.title?.toLowerCase().includes(query);
      const locationMatch = event.location?.toLowerCase().includes(query);
      const descriptionMatch = event.description?.toLowerCase().includes(query);

      if (!titleMatch && !locationMatch && !descriptionMatch) {
        return false;
      }
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
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={type === "event" ? "blue" : "green"}>
          {type === "event" ? "Event" : "Activity"}
        </Tag>
      ),
      filters: [
        { text: "Event", value: "event" },
        { text: "Activity", value: "activity" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (date) => formatDate(date),
      sorter: (a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return dayjs(a.date).unix() - dayjs(b.date).unix();
      },
    },
    {
      title: "Time",
      key: "time",
      width: 150,
      render: (_, record) => {
        if (record.time_start && record.time_end) {
          return `${record.time_start} - ${record.time_end}`;
        } else if (record.time_start) {
          return `${record.time_start} -`;
        }
        return "N/A";
      },
    },
    {
      title: "Status",
      key: "status",
      width: 110,
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
      width: 160,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
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
            className="border-btn"
            style={{ padding: '10px' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this event?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} className="dangerborder-btn"
              style={{ padding: '10px' }} />
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
          <Col xs={24} lg={8}>
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: "Please select type" }]}
                  initialValue="event"
                >
                  <Select
                    size="large"
                    placeholder="Select type"
                  >
                    <Option value="event">Event (Volunteer & Register)</Option>
                    <Option value="activity">Activity (Volunteer only)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="title"
                  label="Event/Activity Title"
                  rules={[
                    { required: true, message: "Please enter event/activity title" },
                  ]}
                >
                  <Input
                    placeholder="e.g., Tree Planting Activity"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: "Please select date" }]}
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

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="time_start"
                      label="Start Time"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        size="large"
                        format="HH:mm"
                        placeholder="Select start time"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="time_end"
                      label="End Time"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        size="large"
                        format="HH:mm"
                        placeholder="Select end time"
                      />
                    </Form.Item>
                  </Col>
                </Row>

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
                    rows={6}
                    placeholder="Event description (optional)"
                    size="large"
                    style={{
                      resize: "none",
                      overflowY: "auto",
                    }}
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
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>All Events ({filteredEvents.length})</span>
                </Space>
              }
            >
              <Space style={{ marginBottom: 16, width: "100%", display: "flex", flexWrap: "wrap" }}>
                <Input
                  placeholder="Search events by title, location, or description..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  style={{ width: 400, marginBottom: 8 }}
                />

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

                <Text strong style={{ marginLeft: 16 }}>Filter by Type:</Text>
                <Select
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: 150 }}
                >
                  <Option value="all">All Types</Option>
                  <Option value="event">Events</Option>
                  <Option value="activity">Activities</Option>
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
                scroll={{ y: 500 }}
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

