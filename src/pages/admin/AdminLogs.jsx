import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Input,
  Select,
  DatePicker,
  Tag,
  Modal,
  Descriptions,
  message,
  Spin,
  Empty,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [filters, setFilters] = useState({
    action: "all",
    entity_type: "all",
    search: "",
    dateRange: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });

  const fetchLogs = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.action !== "all") {
        params.action = filters.action;
      }

      if (filters.entity_type !== "all") {
        params.entity_type = filters.entity_type;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.dateRange && filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].startOf("day").toISOString();
        params.endDate = filters.dateRange[1].endOf("day").toISOString();
      }

      const response = await axios.get(`${API_URL}/admin/getAllLogs`, {
        params,
      });

      setLogs(response.data.logs || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
      }));

    } catch (error) {
      console.error("Error fetching logs:", error);
      if (showLoading) {
        message.error("Failed to load logs");
      }

    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (showDetailsModal) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    fetchLogs(true);


    const pollInterval = setInterval(() => {
      fetchLogs(false);
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [filters, pagination.current, pagination.pageSize, showDetailsModal, fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getActionColor = (action) => {
    if (action.includes("CREATE")) return "green";
    if (action.includes("UPDATE")) return "blue";
    if (action.includes("DELETE")) return "red";
    if (action.includes("DISABLE")) return "orange";
    if (action.includes("ENABLE")) return "cyan";
    if (action.includes("APPROVE")) return "green";
    if (action.includes("REJECT")) return "red";
    if (action.includes("GENERATE")) return "purple";
    return "default";
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (date ? dayjs(date).format("MMM DD, YYYY HH:mm:ss") : "N/A"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 180,
      render: (action) => (
        <Tag color={getActionColor(action)}>{action.replace(/_/g, " ")}</Tag>
      ),
    },
    {
      title: "Entity Type",
      dataIndex: "entity_type",
      key: "entity_type",
      width: 120,
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: "Entity Name",
      dataIndex: "entity_name",
      key: "entity_name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Admin",
      key: "admin",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.admin_name}</div>
          {record.admin_email && (
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              {record.admin_email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => viewLogDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 20 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={2} style={{ fontFamily: "Poppins" }}>
            Admin Activity Logs
          </Title>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Search:
                </Text>
                <Input
                  placeholder="Search by admin name, email, entity name, or action..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  allowClear
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ width: 200 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Action:
                </Text>
                <Select
                  value={filters.action}
                  onChange={(value) => handleFilterChange("action", value)}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Actions</Option>
                  <Option value="CREATE_USER">Create User</Option>
                  <Option value="UPDATE_USER">Update User</Option>
                  <Option value="DISABLE_USER">Disable User</Option>
                  <Option value="ENABLE_USER">Enable User</Option>
                  <Option value="DELETE_USER">Delete User</Option>
                  <Option value="CREATE_ADMIN">Create Admin</Option>
                  <Option value="CREATE_ANNOUNCEMENT">Create Announcement</Option>
                  <Option value="UPDATE_ANNOUNCEMENT">Update Announcement</Option>
                  <Option value="DELETE_ANNOUNCEMENT">Delete Announcement</Option>
                  <Option value="CREATE_EVENT">Create Event</Option>
                  <Option value="UPDATE_EVENT">Update Event</Option>
                  <Option value="DELETE_EVENT">Delete Event</Option>
                  <Option value="CREATE_BOOKING">Create Booking</Option>
                  <Option value="APPROVE_BOOKING">Approve Booking</Option>
                  <Option value="REJECT_BOOKING">Reject Booking</Option>
                  <Option value="UPDATE_BOOKING">Update Booking</Option>
                  <Option value="DELETE_BOOKING">Delete Booking</Option>
                  <Option value="GENERATE_REPORT">Generate Report</Option>
                </Select>
              </div>

              <div style={{ width: 200 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Entity Type:
                </Text>
                <Select
                  value={filters.entity_type}
                  onChange={(value) => handleFilterChange("entity_type", value)}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Types</Option>
                  <Option value="USER">User</Option>
                  <Option value="ADMIN">Admin</Option>
                  <Option value="ANNOUNCEMENT">Announcement</Option>
                  <Option value="EVENT">Event</Option>
                  <Option value="BOOKING">Booking</Option>
                  <Option value="REPORT">Report</Option>
                </Select>
              </div>

              <div style={{ width: 300 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Date Range:
                </Text>
                <RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => handleFilterChange("dateRange", dates)}
                  style={{ width: "100%" }}
                  allowClear
                />
              </div>
            </div>
          </Space>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} logs`,
            }}
            onChange={handleTableChange}
            scroll={{ y: 600 }}
            locale={{
              emptyText: <Empty description="No logs found" />,
            }}
          />
        </Card>

        {/* Details Modal */}
        <Modal
          title="Log Details"
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedLog && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Date & Time">
                {dayjs(selectedLog.createdAt).format("MMMM DD, YYYY HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Action">
                <Tag color={getActionColor(selectedLog.action)}>
                  {selectedLog.action.replace(/_/g, " ")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Entity Type">
                <Tag>{selectedLog.entity_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Entity ID">
                {selectedLog.entity_id || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Entity Name">
                {selectedLog.entity_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Name">
                {selectedLog.admin_name}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Email">
                {selectedLog.admin_email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Admin ID">
                {selectedLog.admin_id}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                {selectedLog.ip_address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="User Agent">
                {selectedLog.user_agent || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Details">
                <pre style={{ whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
}

