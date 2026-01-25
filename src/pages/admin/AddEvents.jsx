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
  Modal,
  List,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";
import dayjs from "dayjs";
import Logger from "../../utils/logger";

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
  const [eventVolunteers, setEventVolunteers] = useState({});
  const [loadingVolunteers, setLoadingVolunteers] = useState({});
  const [volunteerModalVisible, setVolunteerModalVisible] = useState(false);
  const [selectedEventForVolunteers, setSelectedEventForVolunteers] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchLocations();

    const interval = setInterval(() => {
      fetchEvents(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      events.forEach(event => {
        if (event._id && !eventVolunteers[event._id]) {
          fetchEventVolunteersAndParticipants(event._id);
        }
      });
    }
  }, [events]);

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

  const fetchEventVolunteersAndParticipants = async (eventId) => {
    if (!eventId || loadingVolunteers[eventId]) return;

    try {
      setLoadingVolunteers(prev => ({ ...prev, [eventId]: true }));
      const response = await axios.post(`${API_URL}/getEventVolunteers`, {
        event_id: eventId,
      });

      const allVolunteers = response.data.volunteers || [];
      const volunteers = allVolunteers.filter(v => v.registration_type === "volunteer");
      const participants = allVolunteers.filter(v => v.registration_type === "participant");

      setEventVolunteers(prev => ({
        ...prev,
        [eventId]: {
          volunteers,
          participants,
        },
      }));

    } catch (error) {
      console.error(`Error fetching volunteers for event ${eventId}:`, error);
      setEventVolunteers(prev => ({
        ...prev,
        [eventId]: {
          volunteers: [],
          participants: [],
        },
      }));

    } finally {
      setLoadingVolunteers(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleViewVolunteers = (event) => {
    setSelectedEventForVolunteers(event);
    if (!eventVolunteers[event._id]) {
      fetchEventVolunteersAndParticipants(event._id);
    }

    setVolunteerModalVisible(true);
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

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    let parsed = dayjs(timeStr, "h:mm A", true);
    if (parsed.isValid()) {
      return parsed.hour() * 60 + parsed.minute();
    }

    parsed = dayjs(timeStr, "HH:mm", true);
    if (parsed.isValid()) {
      return parsed.hour() * 60 + parsed.minute();
    }
    return null;
  };

  const checkTimeConflict = (date, timeStart, timeEnd, location, excludeEventId = null) => {
    if (!timeStart || !timeEnd || !location) return null;

    const eventDate = date.format("YYYY-MM-DD");
    const startMinutes = timeToMinutes(timeStart.format("h:mm A"));
    const endMinutes = timeToMinutes(timeEnd.format("h:mm A"));

    if (startMinutes === null || endMinutes === null) return null;

    const conflictingEvent = events.find((event) => {
      if (excludeEventId && event._id === excludeEventId) return false;

      const eventDateStr = dayjs(event.date).format("YYYY-MM-DD");
      if (eventDateStr !== eventDate || event.location !== location) {
        return false;
      }

      if (!event.time_start || !event.time_end) return false;

      const existingStart = timeToMinutes(event.time_start);
      const existingEnd = timeToMinutes(event.time_end);

      if (existingStart === null || existingEnd === null) return false;

      return startMinutes < existingEnd && endMinutes > existingStart;
    });

    return conflictingEvent;
  };

  const handleSubmit = async (values) => {
    try {
      if (values.time_start && values.time_end) {
        const startMinutes = timeToMinutes(values.time_start.format("h:mm A"));
        const endMinutes = timeToMinutes(values.time_end.format("h:mm A"));

        if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
          message.error("End time must be after start time.");
          return;
        }
      }

      if (values.time_start && values.time_end && values.location && values.date) {
        const conflictingEvent = checkTimeConflict(
          values.date,
          values.time_start,
          values.time_end,
          values.location,
          editingEvent?._id
        );

        if (conflictingEvent) {
          message.error(
            `Time conflict detected! There is already an event "${conflictingEvent.title}" scheduled at ${conflictingEvent.location} on ${formatDate(conflictingEvent.date)} from ${conflictingEvent.time_start} to ${conflictingEvent.time_end}.`
          );
          return;
        }
      }

      setLoading(true);
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("type", values.type || "event");
      formData.append("date", values.date.format("YYYY-MM-DD"));
      formData.append("time_start", values.time_start ? values.time_start.format("h:mm A") : "");
      formData.append("time_end", values.time_end ? values.time_end.format("h:mm A") : "");
      formData.append("location", values.location);

      if (values.description) {
        formData.append("description", values.description);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      let eventId;
      if (editingEvent) {
        eventId = editingEvent._id;
        formData.append("eventId", eventId);
        await axios.put(`${API_URL}/admin/updateEvent`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        await Logger.logUpdateEvent(eventId, values.title);
        message.success("Event updated successfully!");

      } else {
        const response = await axios.post(`${API_URL}/admin/createEvent`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const newEvent = response.data?.event || response.data;
        eventId = newEvent?._id || newEvent?.id;
        await Logger.logCreateEvent(eventId, values.title);
        message.success("Event created successfully!");
      }

      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
      setEditingEvent(null);
      await fetchEvents();
 
      if (eventId) {
        fetchEventVolunteersAndParticipants(eventId);
      }

    } catch (error) {
      console.error("Error saving event:", error);
      message.error(error.response?.data?.message || "Failed to save event. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      let parsed = dayjs(timeStr, "h:mm A", true);
      if (parsed.isValid()) return parsed;
      parsed = dayjs(timeStr, "HH:mm", true);
      if (parsed.isValid()) return parsed;
      return null;
    };
    
    form.setFieldsValue({
      type: event.type || "event",
      title: event.title,
      date: event.date ? dayjs(event.date) : null,
      time_start: parseTime(event.time_start),
      time_end: parseTime(event.time_end),
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
      const event = events.find(e => e._id === eventId);
      await axios.delete(`${API_URL}/admin/deleteEvent/${eventId}`);
      await Logger.logDeleteEvent(eventId, event?.title || "Unknown");
      message.success("Event deleted successfully!");
      
      setEventVolunteers(prev => {
        const newData = { ...prev };
        delete newData[eventId];
        return newData;
      });
      
      await fetchEvents();

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
      width: 80,
      render: (image) => (
        <Image
          src={image || "/no-image.jpg"}
          alt="Event"
          width={60}
          height={45}
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="/no-image.jpg"
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
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
      width: 100,
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
      title: "Actions",
      key: "actions",
      width: 100,
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
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 20 }}>
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
                    { min: 3, message: "Title must be at least 3 characters long" },
                    { max: 200, message: "Title must not exceed 200 characters" },
                    {
                      validator: (_, value) => {
                        if (!value || value.trim().length === 0) {
                          return Promise.reject(new Error("Title cannot be empty or only whitespace"));
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        
                        const trimmedValue = value.trim().toLowerCase();
                        const duplicateEvent = events.find((event) => {

                          if (editingEvent && event._id === editingEvent._id) {
                            return false;
                          }

                          return event.title && event.title.trim().toLowerCase() === trimmedValue;
                        });
                        
                        if (duplicateEvent) {
                          return Promise.reject(new Error("An event/activity with this title already exists"));
                        }
                        
                        return Promise.resolve();
                      },
                    },
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
                      rules={[{ required: true, message: "Please select start time" }]}
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        size="large"
                        format="h:mm A"
                        placeholder="Select start time"
                        minuteStep={10}
                        use12Hours
                        onChange={() => {
                          const timeStart = form.getFieldValue('time_start');
                          const timeEnd = form.getFieldValue('time_end');
                          if (timeStart && timeEnd) {
                            const startMinutes = timeStart.hour() * 60 + timeStart.minute();
                            const endMinutes = timeEnd.hour() * 60 + timeEnd.minute();
                            if (endMinutes <= startMinutes) {
                              form.setFieldsValue({ time_end: null });
                            }
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="time_end"
                      label="End Time"
                      dependencies={['time_start']}
                      rules={[
                        { required: true, message: "Please select end time" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.resolve();
                            }

                            const timeStart = getFieldValue('time_start');
                            if (!timeStart) {
                              return Promise.resolve();
                            }

                            const startMinutes = timeStart.hour() * 60 + timeStart.minute();
                            const endMinutes = value.hour() * 60 + value.minute();
                            
                            if (endMinutes <= startMinutes) {
                              return Promise.reject(new Error('End time must be after start time'));
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        size="large"
                        format="h:mm A"
                        placeholder="Select end time"
                        minuteStep={10}
                        use12Hours
                        disabledTime={() => {
                          const timeStart = form.getFieldValue('time_start');
                          if (!timeStart) {
                            return {};
                          }
                          
                          const startHour = timeStart.hour();
                          const startMinute = timeStart.minute();
                          const startTotalMinutes = startHour * 60 + startMinute;
                          
                          return {
                            disabledHours: () => {
                              const hours = [];
                              for (let h = 0; h < 24; h++) {
                                const hourMinutes = h * 60;
                                if (hourMinutes + 59 < startTotalMinutes) {
                                  hours.push(h);
                                }
                              }

                              return hours;
                            },
                            disabledMinutes: (selectedHour) => {
                              if (!selectedHour) return [];
                              
                              const hourMinutes = selectedHour * 60;
                              const minutes = [];

                              if (selectedHour === startHour) {
                                for (let m = 0; m <= startMinute; m += 10) {
                                  minutes.push(m);
                                }

                              } else if (hourMinutes < startTotalMinutes) {
                                for (let m = 0; m < 60; m += 10) {
                                  minutes.push(m);
                                }
                              }
                              
                              return minutes;
                            },
                          };
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: "Please enter event location" }]}
                >
                  <Input
                    placeholder="e.g., Church Main Hall"
                    size="large"
                  />
                </Form.Item>

                <Form.Item 
                  name="description" 
                  label="Description"
                  rules={[{ required: true, message: "Please enter event description" }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Event description"
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
                      className="filled-btn"
                      style={{ alignContent: 'right' }}
                    >
                      {editingEvent ? "Update Event" : "Create Event"}
                    </Button>
                    {editingEvent && (
                      <Button className="cancelborder-btn" size="large" onClick={handleCancel}>
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
            >

              <Space direction="vertical" style={{ marginBottom: 16, width: "100%" }} size="middle">
                <Space style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                  <Input
                    placeholder="Search events by title, location, or description..."
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    style={{ width: 250 }}
                  />

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

                <Space style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
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
                onRow={(record) => ({
                  onClick: (e) => {
                    const target = e.target;
                    if (
                      target.closest('button') ||
                      target.closest('a') ||
                      target.closest('.ant-btn') ||
                      target.closest('.ant-popconfirm')
                    ) {
                      return;
                    }
                    handleViewVolunteers(record);
                  },
                  style: { cursor: 'pointer' },
                })}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal for viewing volunteers and participants */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Event Details - Volunteers & Participants</span>
          </Space>
        }
        open={volunteerModalVisible}
        onCancel={() => {
          setVolunteerModalVisible(false);
          setSelectedEventForVolunteers(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setVolunteerModalVisible(false);
            setSelectedEventForVolunteers(null);
          }}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedEventForVolunteers && (
          <div>
            {/* Event Details Section */}
            <Card
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Event Information</span>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                {selectedEventForVolunteers.image && (
                  <Col span={24}>
                    <Image
                      src={selectedEventForVolunteers.image}
                      alt={selectedEventForVolunteers.title}
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                      fallback="/no-image.jpg"
                    />
                  </Col>
                )}
                <Col span={24}>
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div>
                      <Text strong style={{ fontSize: 18 }}>
                        {selectedEventForVolunteers.title}
                      </Text>
                      <Tag
                        color={selectedEventForVolunteers.type === "event" ? "blue" : "green"}
                        style={{ marginLeft: 8 }}
                      >
                        {selectedEventForVolunteers.type === "event" ? "Event" : "Activity"}
                      </Tag>
                    </div>
                    {selectedEventForVolunteers.description && (
                      <div>
                        <Text type="secondary">{selectedEventForVolunteers.description}</Text>
                      </div>
                    )}
                  </Space>
                </Col>
                <Col span={24}>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Space>
                        <CalendarOutlined />
                        <Text strong>Date:</Text>
                        <Text>{formatDate(selectedEventForVolunteers.date)}</Text>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space>
                        <EnvironmentOutlined />
                        <Text strong>Location:</Text>
                        <Text>{selectedEventForVolunteers.location || "N/A"}</Text>
                      </Space>
                    </Col>
                    {(selectedEventForVolunteers.time_start || selectedEventForVolunteers.time_end) && (
                      <Col span={12}>
                        <Space>
                          <Text strong>Time:</Text>
                          <Text>
                            {selectedEventForVolunteers.time_start && selectedEventForVolunteers.time_end
                              ? `${selectedEventForVolunteers.time_start} - ${selectedEventForVolunteers.time_end}`
                              : selectedEventForVolunteers.time_start
                              ? `${selectedEventForVolunteers.time_start} -`
                              : "N/A"}
                          </Text>
                        </Space>
                      </Col>
                    )}
                    <Col span={12}>
                      <Space>
                        <Text strong>Status:</Text>
                        {(() => {
                          const statusInfo = getEventStatus(selectedEventForVolunteers.date);
                          return (
                            <Tag color={statusInfo.color}>
                              {statusInfo.text}
                            </Tag>
                          );
                        })()}
                      </Space>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Volunteers and Participants Section */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  title={
                    <Space>
                      <TeamOutlined />
                      <span>
                        Volunteers (
                        {eventVolunteers[selectedEventForVolunteers._id]?.volunteers?.length || 0})
                      </span>
                    </Space>
                  }
                  size="small"
                >
                  {loadingVolunteers[selectedEventForVolunteers._id] ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      Loading...
                    </div>
                  ) : (
                    <List
                      dataSource={eventVolunteers[selectedEventForVolunteers._id]?.volunteers || []}
                      locale={{ emptyText: "No volunteers registered for this event" }}
                      renderItem={(volunteer) => (
                        <List.Item>
                          <List.Item.Meta
                            title={volunteer.name}
                            description={
                              <Space>
                                <Text type="secondary">{volunteer.contact}</Text>
                                <Tag color={volunteer.status === "confirmed" ? "green" : "orange"}>
                                  {volunteer.status}
                                </Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <span>
                        Participants (
                        {eventVolunteers[selectedEventForVolunteers._id]?.participants?.length || 0})
                      </span>
                    </Space>
                  }
                  size="small"
                >
                  {loadingVolunteers[selectedEventForVolunteers._id] ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      Loading...
                    </div>
                  ) : (
                    <List
                      dataSource={eventVolunteers[selectedEventForVolunteers._id]?.participants || []}
                      locale={{ emptyText: "No participants registered for this event" }}
                      renderItem={(participant) => (
                        <List.Item>
                          <List.Item.Meta
                            title={participant.name}
                            description={
                              <Space>
                                <Text type="secondary">{participant.contact}</Text>
                                <Tag color={participant.status === "confirmed" ? "green" : "orange"}>
                                  {participant.status}
                                </Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}

