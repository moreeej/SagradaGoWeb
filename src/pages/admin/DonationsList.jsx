import { useState, useEffect, useCallback } from "react";
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
  SearchOutlined,
  EyeOutlined,
  PictureOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
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
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");

  useEffect(() => {
    filterDonations();
  }, [searchTerm, paymentMethodFilter, donations]);

  const fetchDonations = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));

    } catch (error) {
      console.error("Error fetching donations:", error);
      if (showLoading) {
        message.error("Failed to fetch donations. Please try again.");
      }

    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDonations(true);

    const intervalId = setInterval(() => {
      fetchDonations(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [statusFilter, pagination.page, pagination.limit]);

  const filterDonations = () => {
    let filtered = donations;

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((donation) => {
        const method = donation.paymentMethod || "";

        if (paymentMethodFilter === "In Kind") {
          return method.toLowerCase() === "in kind";

        } else if (paymentMethodFilter === "GCash") {
          return method.toLowerCase() === "gcash";

        } else if (paymentMethodFilter === "Cash") {
          return method.toLowerCase() === "cash";

        }
        return true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (donation) =>
          (donation.name || donation.user_name)?.toLowerCase().includes(term) ||
          (donation.email || donation.user_email)?.toLowerCase().includes(term) ||
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
      fetchDonations(false);
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

  const getSupabaseImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
    if (!supabaseUrl) {
      console.warn("Supabase URL not configured");
      return null;
    }

    return `${supabaseUrl}/storage/v1/object/public/donations/${imagePath}`;
  };

  const handleViewImage = (imagePath, title) => {
    const imageUrl = getSupabaseImageUrl(imagePath);
    if (imageUrl) {
      setSelectedImageUrl(imageUrl);
      setSelectedImageTitle(title);
      setImageModalVisible(true);
    } else {
      message.warning("Image URL not available");
    }
  };

  const columns = [
    {
      title: "Donor Name",
      dataIndex: "user_name",
      key: "user_name",
      width: 300,
      render: (_, record) => <Text strong>{record.name || record.user_name || "N/A"}</Text>,
    },
    {
      title: "Email",
      dataIndex: "user_email",
      key: "user_email",
      width: 300,
      render: (_, record) => record.email || record.user_email || "N/A",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 250,
      render: (amount) => (
        <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (method) => getPaymentMethodTag(method),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
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
      width: 200,
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
              className="border-btn"
              style={{ padding: '8px' }}
              onClick={() => {
                setSelectedDonation(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                className="border-btn"
                style={{ padding: '8px' }}
                onClick={() => handleStatusUpdate(record._id, "confirmed")}
                loading={updateLoading}
              />
              <Button
                type="link"
                icon={<CloseOutlined />}
                className="dangerborder-btn"
                style={{ padding: '8px' }}
                onClick={() => handleStatusUpdate(record._id, "cancelled")}
                loading={updateLoading}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 20 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#262626", fontFamily: 'Poppins' }}>
                Donations Management
              </Title>
              <Text type="secondary" style={{ fontSize: 16, fontFamily: 'Poppins' }}>
                Manage and track all donations
              </Text>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Donations"
                value={stats.total}
                prefix={<DollarOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Confirmed"
                value={stats.confirmed}
                prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cancelled"
                value={stats.cancelled}
                prefix={<CloseCircleOutlined style={{ marginRight: 8 }} />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search by name, email, or payment method..."
                prefix={<SearchOutlined style={{ marginRight: 8 }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '10px 12px',
                  height: '42px',
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '8px 12px',
                  height: '42px',
                }}
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
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  padding: '8px 12px',
                  height: '42px',
                }}
                value={paymentMethodFilter}
                onChange={setPaymentMethodFilter}
                placeholder="Filter by payment method"
              >
                <Option value="all">All Payment Methods</Option>
                <Option value="GCash">GCash</Option>
                <Option value="Cash">Cash</Option>
                <Option value="In Kind">In Kind</Option>
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
            scroll={{ y: 600 }}
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
                  <div>{selectedDonation.name || selectedDonation.user_name || "N/A"}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Email:</Text>
                  <div>{selectedDonation.email || selectedDonation.user_email || "N/A"}</div>
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
                {selectedDonation.donationImage && (
                  <Col span={24}>
                    <Text strong>Donation Image (In Kind):</Text>
                    <div style={{ marginTop: 8 }}>
                      <Button
                        type="link"
                        icon={<PictureOutlined />}
                        onClick={() => handleViewImage(selectedDonation.donationImage, "Donation Image")}
                      >
                        View Image
                      </Button>
                    </div>
                  </Col>
                )}
                {selectedDonation.receipt && (
                  <Col span={24}>
                    <Text strong>GCash Receipt:</Text>
                    <div style={{ marginTop: 8 }}>
                      <Button
                        type="link"
                        icon={<PictureOutlined />}
                        onClick={() => handleViewImage(selectedDonation.receipt, "GCash Receipt")}
                      >
                        View Receipt
                      </Button>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>

        {/* Image View Modal */}
        <Modal
          title={selectedImageTitle}
          open={imageModalVisible}
          onCancel={() => {
            setImageModalVisible(false);
            setSelectedImageUrl(null);
            setSelectedImageTitle("");
          }}
          footer={[
            <Button key="close" onClick={() => setImageModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={800}
          centered
        >
          {selectedImageUrl && (
            <div style={{ textAlign: "center" }}>
              <img
                src={selectedImageUrl}
                alt={selectedImageTitle}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
                onError={(e) => {
                  message.error("Failed to load image");
                  console.error("Image load error:", selectedImageUrl);
                }}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
