import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  Modal,
  message,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DonationsList() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, pagination.page]);

  useEffect(() => {
    filterDonations();
  }, [searchTerm, donations]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await axios.get(`${API_URL}/admin/getAllDonations`, {
        params,
      });

      setDonations(response.data.donations || []);
      setStats(response.data.stats || stats);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      });

    } catch (error) {
      console.error("Error fetching donations:", error);
      message.error("Failed to fetch donations. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = donations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (donation) =>
          donation.user_name?.toLowerCase().includes(term) ||
          donation.user_email?.toLowerCase().includes(term) ||
          donation.paymentMethod?.toLowerCase().includes(term) ||
          donation.intercession?.toLowerCase().includes(term)
      );
    }

    setFilteredDonations(filtered);
  };

  const handleStatusUpdate = async (donationId, newStatus) => {
    try {
      setUpdateLoading(true);
      await axios.put(`${API_URL}/admin/updateDonationStatus`, {
        donationId,
        status: newStatus,
      });

      message.success(
        `Donation ${newStatus === "confirmed" ? "confirmed" : newStatus === "cancelled" ? "cancelled" : "updated"} successfully.`
      );
      fetchDonations();
      setDetailModalVisible(false);

    } catch (error) {
      console.error("Error updating donation status:", error);
      message.error("Failed to update donation status. Please try again.");
      
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
      confirmed: { color: "green", icon: <CheckCircleOutlined />, text: "Confirmed" },
      cancelled: { color: "red", icon: <CloseCircleOutlined />, text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getPaymentMethodTag = (method) => {
    const colorMap = {
      GCash: "blue",
      Cash: "green",
      "In Kind": "purple",
    };
    return <Tag color={colorMap[method] || "default"}>{method}</Tag>;
  };

  const columns = [
    {
      title: "Donor Name",
      dataIndex: "user_name",
      key: "user_name",
      render: (text) => <Text strong>{text || "N/A"}</Text>,
    },
    {
      title: "Email",
      dataIndex: "user_email",
      key: "user_email",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => getPaymentMethodTag(method),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Confirmed", value: "confirmed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDonation(record);
                setDetailModalVisible(true);
              }}
            >
              View
            </Button>
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                style={{ color: "#52c41a" }}
                onClick={() => handleStatusUpdate(record._id, "confirmed")}
                loading={updateLoading}
              >
                Confirm
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleStatusUpdate(record._id, "cancelled")}
                loading={updateLoading}
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#262626" }}>
                Donations Management
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Manage and track all donations
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDonations}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Donations"
                value={stats.total}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Confirmed"
                value={stats.confirmed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cancelled"
                value={stats.cancelled}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search by name, email, or payment method..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Donations Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredDonations}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} donations`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, page, limit: pageSize });
              },
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Donation Detail Modal */}
        <Modal
          title="Donation Details"
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedDonation(null);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>,
            selectedDonation?.status === "pending" && (
              <Button
                key="confirm"
                type="primary"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleStatusUpdate(selectedDonation._id, "confirmed")}
                loading={updateLoading}
              >
                Confirm Donation
              </Button>
            ),
            selectedDonation?.status === "pending" && (
              <Button
                key="cancel"
                danger
                onClick={() => handleStatusUpdate(selectedDonation._id, "cancelled")}
                loading={updateLoading}
              >
                Cancel Donation
              </Button>
            ),
          ].filter(Boolean)}
          width={600}
        >
          {selectedDonation && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Donor Name:</Text>
                  <div>{selectedDonation.user_name}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Email:</Text>
                  <div>{selectedDonation.user_email}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Amount:</Text>
                  <div style={{ color: "#52c41a", fontSize: "18px", fontWeight: "bold" }}>
                    {formatCurrency(selectedDonation.amount)}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Payment Method:</Text>
                  <div>{getPaymentMethodTag(selectedDonation.paymentMethod)}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text>
                  <div>{getStatusTag(selectedDonation.status)}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Date:</Text>
                  <div>{formatDate(selectedDonation.createdAt)}</div>
                </Col>
                {selectedDonation.intercession && (
                  <Col span={24}>
                    <Text strong>Intercession:</Text>
                    <div style={{ marginTop: 8, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
                      {selectedDonation.intercession}
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
