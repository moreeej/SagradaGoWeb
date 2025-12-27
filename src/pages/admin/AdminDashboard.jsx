import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Statistic, Button, Space, Tag, Typography, Spin, Empty, Calendar, Modal } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserAddOutlined,
  BookOutlined,
  HeartOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { API_URL } from "../../Constants";
import "../../styles/dashboard.css";
import CustomCalendar from "../../components/CustomCalendar";
import ReportTemplate from "../../components/ReportTemplate";

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dayBookings, setDayBookings] = useState([]); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [donationReportData, setDonationReportData] = useState([]);
  const [bookingReportData, setBookingReportData] = useState([]);
  const [systemReportData, setSystemReportData] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPriests: 0,
    pendingBookings: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    totalVolunteers: 0,
    recentUsers: [],
  });

  useEffect(() => {
    fetchDashboardData();
    fetchAIAnalysis();
  }, []);

  const fetchAIAnalysis = async () => {
    try {
      setLoadingAI(true);
      const response = await axios.get(`${API_URL}/admin/ai/stats`);

      if (response.data.success && response.data.analysis) {
        setAiAnalysis(response.data.analysis);
      }

    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      setAiAnalysis("Unable to generate AI analysis at this time.");
      
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersResponse, allDonationsRes, monthlyDonationRes, donationsListRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/getAllUsers`),
        axios.get(`${API_URL}/admin/getDonationStatistics`).catch((error) => {
          console.error("Error fetching donation statistics:", error);
          return { data: { stats: { amounts: { total: 0, confirmed: 0, pending: 0 }, counts: { total: 0, pending: 0, confirmed: 0, cancelled: 0 } } } };
        }),

        axios.get(`${API_URL}/admin/getMonthlyDonations`).catch((error) => {
          console.error("Error fetching monthly donations:", error);
          return { data: { totalAmount: 0, count: 0, monthlyDonations: [] } };
        }),

        axios.get(`${API_URL}/admin/getAllDonations`, { params: { limit: 100 } }).catch((error) => {
          console.error("Error fetching donations list:", error);
          return { data: { donations: [] } };
        }),

        axios.all([
          axios.get(`${API_URL}/admin/getAllWeddings`).catch(() => ({ data: { weddings: [] } })),
          axios.get(`${API_URL}/admin/getAllBaptisms`).catch(() => ({ data: { baptisms: [] } })),
          axios.get(`${API_URL}/admin/getAllBurials`).catch(() => ({ data: { burials: [] } })),
          axios.get(`${API_URL}/admin/getAllCommunions`).catch(() => ({ data: { communions: [] } })),
          axios.get(`${API_URL}/admin/getAllConfirmations`).catch(() => ({ data: { confirmations: [] } })),
          axios.get(`${API_URL}/admin/getAllAnointings`).catch(() => ({ data: { anointings: [] } })),
          axios.get(`${API_URL}/admin/getAllConfessions`).catch(() => ({ data: { bookings: [] } })),
        ]),
      ]);

      const users = usersResponse.data || [];
      const priests = users.filter((user) => user.is_priest === true);

      const [weddings, baptisms, burials, communions, confirmations, anointings, confessions] = bookingsRes;

      const normalizedConfessions = (confessions.data.bookings || []).map((b) => ({
        ...b,
        bookingType: "Confession",
        date: b.date ? new Date(b.date).toISOString() : null,
        status: b.status || "pending",
        full_name: b.full_name || "N/A",
      }));

      const allBookings = [
        ...(weddings.data.weddings || []).map((b) => ({ ...b, bookingType: "Wedding" })),
        ...(baptisms.data.baptisms || []).map((b) => ({ ...b, bookingType: "Baptism" })),
        ...(burials.data.burials || []).map((b) => ({ ...b, bookingType: "Burial" })),
        ...(communions.data.communions || []).map((b) => ({ ...b, bookingType: "Communion" })),
        ...(confirmations.data.confirmations || []).map((b) => ({ ...b, bookingType: "Confirmation" })),
        ...(anointings.data.anointings || []).map((b) => ({ ...b, bookingType: "Anointing" })),
        ...normalizedConfessions,
      ];

      const confirmedBookings = allBookings.filter((b) => {
        const status = (b.status || "").toLowerCase();
        return status === "confirmed";
      });

      const getBookingName = (booking) => {
        if (booking.bookingType === "Wedding") {
          const groom = `${booking.groom_first_name || ''} ${booking.groom_last_name || ''}`.trim();
          const bride = `${booking.bride_first_name || ''} ${booking.bride_last_name || ''}`.trim();
          return groom && bride ? `${groom} & ${bride}` : (groom || bride || booking.full_name || "Wedding");

        } else if (booking.bookingType === "Burial") {
          return booking.deceased_name || booking.name || booking.user?.name || booking.full_name || "Burial Service";

        } else {
          return booking.user?.name || booking.name || booking.full_name || `${booking.first_name || ""} ${booking.last_name || ""}`.trim() || booking.bookingType || "Event";
        }
      };

      const getBookingEmail = (booking) => {
        return booking.user?.email || booking.email || "N/A";
      };

      const eventsForCalendar = confirmedBookings.map((b) => {
        if (!b.date) return null;
        const bookingDate = dayjs(b.date);

        if (!bookingDate.isValid()) return null;
        const bookingType = b.bookingType || "Event";

        return {
          date: bookingDate.format("YYYY-MM-DD"),
          name: bookingType,
          type: bookingType,
          status: b.status || "pending",
          bookingName: getBookingName(b),
          bookingType,
          email: getBookingEmail(b),
          transaction_id: b.transaction_id,
          time: b.time,
          attendees: b.attendees,
          contact_number: b.contact_number,
          groom_first_name: b.groom_first_name,
          groom_last_name: b.groom_last_name,
          bride_first_name: b.bride_first_name,
          bride_last_name: b.bride_last_name,
          deceased_name: b.deceased_name,
        };
      }).filter(Boolean);

      setCalendarEvents(eventsForCalendar);

      const pendingBookingsCount = allBookings.filter((b) => b.status === "pending").length;
      const recentUsers = users.slice().reverse().slice(0, 5);

      setStats({
        totalUsers: users.filter((u) => !u.is_priest).length,
        totalPriests: priests.length,
        pendingBookings: pendingBookingsCount,
        totalDonations: allDonationsRes?.data?.stats?.amounts?.total || 0,
        monthlyDonations: monthlyDonationRes?.data?.totalAmount || 0,
        totalVolunteers: 0,
        recentUsers: recentUsers,
      });

      setDonationReportData(
        (donationsListRes?.data?.donations || []).map((d, i) => ({
          id: d._id || i,
          donor_name: d.user_name || "N/A",
          email: d.user_email || "N/A",
          amount: d.amount || 0,
          paymentMethod: d.paymentMethod || "N/A",
          date: d.createdAt || "",
          transaction_id: d._id || "N/A",
        }))
      );

      setBookingReportData(allBookings.map((b) => ({
        bookingName: getBookingName(b),
        bookingType: b.bookingType,
        status: b.status || "pending",
        date: b.date,
        contact_number: b.contact_number,
      })));

      setSystemReportData([
        { metric: "Total Users", value: users.filter((u) => !u.is_priest).length },
        { metric: "Total Priests", value: priests.length },
        { metric: "Total Donations", value: allDonationsRes.data.stats.amounts.total || 0 },
        { metric: "Pending Bookings", value: allBookings.filter((b) => b.status === "pending").length },
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);

    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("currentUser")) || null;
  const isPriest = user?.is_priest || false;

  const handleBookingClick = (bookingOrBookings, clickedBooking) => {
    if (Array.isArray(bookingOrBookings)) {
      setDayBookings(bookingOrBookings);
      setSelectedBooking(clickedBooking || bookingOrBookings[0]);

    } else {
      setDayBookings([]);
      setSelectedBooking(bookingOrBookings);
    }
    
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedBooking(null);
    setDayBookings([]);
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const quickActions = [
    {
      title: "Account Management",
      description: "Manage users and priests",
      icon: <UserAddOutlined style={{ fontSize: 32, color: "#b87d3e" }} />,
      path: "/admin/account-management",
      color: "#b87d3e",
    },
    {
      title: "View Bookings",
      description: "Manage service bookings",
      icon: <BookOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      path: "/admin/bookings",
      color: "#1890ff",
    },
    {
      title: "View Donations",
      description: "Track donations",
      icon: <DollarOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
      path: "/admin/donations",
      color: "#52c41a",
    },
    {
      title: "View Volunteers",
      description: "Manage volunteers",
      icon: <HeartOutlined style={{ fontSize: 32, color: "#f5222d" }} />,
      path: "/admin/volunteers",
      color: "#f5222d",
    },
  ];


  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <Spin size="large" />
      </div>
    );
  }

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    const details = [];

    Object.keys(selectedBooking).forEach((key) => {
      if (["_id", "__v", "user"].includes(key)) return;

      const value = selectedBooking[key];

      if (value !== null && value !== undefined && value !== "") {
        details.push({ key, value });
      }
    });

    return (
      <div>
        {/* Show booking selector if there are multiple bookings */}
        {dayBookings.length > 1 && (
          <div style={{ marginBottom: 20, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 6 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Multiple bookings on this day ({dayBookings.length}):
            </Text>
            <Space wrap>
              {dayBookings.map((booking, index) => (
                <Button
                  key={index}
                  type={selectedBooking === booking ? "primary" : "default"}
                  size="small"
                  onClick={() => handleSelectBooking(booking)}
                >
                  {booking.bookingType || booking.type} {booking.time ? `(${booking.time})` : ""}
                </Button>
              ))}
            </Space>
          </div>
        )}
        
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Booking Type:</Text>
            <div>{selectedBooking.bookingType || selectedBooking.type}</div>
          </Col>
          <Col span={24}>
            <Text strong>Status:</Text>
            <div>{selectedBooking.status}</div>
          </Col>
          {details.map(({ key, value }) => (
            <Col span={12} key={key}>
              <Text strong>{key.replace(/_/g, " ")}</Text>
              <div>{value}</div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const donationColumns = [
    { title: "Donor Name", dataIndex: "donor_name", key: "donor_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value) => {
        const amount = typeof value === 'number' ? value : parseFloat(value) || 0;
        return `₱${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    },
    { title: "Payment Method", dataIndex: "paymentMethod", key: "paymentMethod" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Transaction ID", dataIndex: "transaction_id", key: "transaction_id" },
  ];

  const bookingColumns = [
    { title: "Booking Name", dataIndex: "bookingName", key: "bookingName" },
    { title: "Type", dataIndex: "bookingType", key: "bookingType" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Contact", dataIndex: "contact_number", key: "contact_number" },
  ];

  const systemOverviewColumns = [
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Value", dataIndex: "value", key: "value" },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <Title level={2} className="dashboard-title">Welcome Back, Abel!</Title>
              <Text type="secondary" className="dashboard-subtitle">
                Here's what's happening today.
              </Text>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="dashboard-stats-grid">
          {!isPriest && (
            <Col xs={24} sm={12} lg={6}>
              <Card className="dashboard-stat-card">
                <Statistic
                  title="Total Users"
                  value={stats.totalUsers}
                  prefix={<UserOutlined style={{ marginRight: 8 }}/>}
                  valueStyle={{ color: "#1890ff" }}
                />
                <div className="dashboard-stat-title">
                  <Text type="secondary" className="dashboard-stat-text">Regular users</Text>
                </div>
              </Card>
            </Col>
          )}
          <Col xs={24} sm={12} lg={6}>
            <Card className="dashboard-stat-card">
              <Statistic
                title="Total Priests"
                value={stats.totalPriests}
                prefix={<TeamOutlined style={{ marginRight: 8 }}/>}
                valueStyle={{ color: "#722ed1" }}
              />
              <div className="dashboard-stat-title">
                <Text type="secondary" className="dashboard-stat-text">Active priests</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="dashboard-stat-card"
              hoverable
              onClick={() => navigate("/admin/bookings?status=pending")}
              style={{ cursor: "pointer" }}
            >
              <Statistic
                title="Pending Bookings"
                value={stats.pendingBookings}
                prefix={<CalendarOutlined style={{ marginRight: 8 }}/>}
                valueStyle={{ color: "#fa8c16" }}
              />
              <div className="dashboard-stat-title">
                <Text type="secondary" className="dashboard-stat-text">Awaiting approval (click to view)</Text>
              </div>
            </Card>
          </Col>
          {!isPriest && (
            <Col xs={24} sm={12} lg={6}>
              <Card className="dashboard-stat-card">
                <Statistic
                  title="Total Donations"
                  value={stats.totalDonations}
                  prefix={<DollarOutlined style={{ marginRight: 8 }}/>}
                  precision={2}
                  valueStyle={{ color: "#52c41a" }}
                />
                <div className="dashboard-stat-title">
                  <Text type="secondary" className="dashboard-stat-text">All-time donations</Text>
                </div>
              </Card>
            </Col>
          )}
        </Row>

        {/* Quick Actions */}
        <Card title={<Title level={4} className="dashboard-quick-actions-title">Quick Actions</Title>} className="dashboard-quick-actions-card">
          <Row gutter={[16, 16]}>
            {quickActions.map((action, index) => {
              const cardClass =
                action.path.includes("account") ? "dashboard-quick-action-card-users" :
                  action.path.includes("bookings") ? "dashboard-quick-action-card-bookings" :
                    action.path.includes("donations") ? "dashboard-quick-action-card-donations" :
                      "dashboard-quick-action-card-volunteers";
              return (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card hoverable onClick={() => navigate(action.path)} className={`dashboard-quick-action-card ${cardClass}`} bodyStyle={{ padding: "24px" }}>
                    <div className="dashboard-quick-action-icon">{action.icon}</div>
                    <Title level={5} className="dashboard-quick-action-title">{action.title}</Title>
                    <Text type="secondary" className="dashboard-quick-action-description">{action.description}</Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* AI Stats Analysis */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card 
              title={
                <Space>
                  <RobotOutlined style={{ color: "#1890ff" }} />
                  <Title level={4} className="dashboard-system-overview-title" style={{ margin: 0 }}>
                    AI-Powered Insights
                  </Title>
                </Space>
              } 
              className="dashboard-system-overview-card"
              extra={
                <Button 
                  type="link" 
                  onClick={fetchAIAnalysis} 
                  loading={loadingAI}
                  icon={<RobotOutlined />}
                >
                  Refresh Analysis
                </Button>
              }
            >
              {loadingAI ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="large" tip="Generating AI insights..." />
                </div>
              ) : aiAnalysis ? (
                <div style={{ 
                  padding: "16px", 
                  backgroundColor: "#f5f5f5", 
                  borderRadius: "8px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  fontSize: "14px"
                }}>
                  {aiAnalysis}
                </div>
              ) : (
                <Empty description="No AI analysis available" />
              )}
            </Card>
          </Col>
        </Row>

        {/* System Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card title={<Title level={4} className="dashboard-system-overview-title">System Overview</Title>} className="dashboard-system-overview-card">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="dashboard-system-overview-item">
                    <Text>System Status</Text>
                    <Tag color="success">Operational</Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="dashboard-system-overview-item">
                    <Text>Total Accounts</Text>
                    <Text strong>{stats.totalUsers + stats.totalPriests}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="dashboard-system-overview-item">
                    <Text>User Ratio</Text>
                    <Text strong>
                      {stats.totalUsers > 0
                        ? ((stats.totalUsers / (stats.totalUsers + stats.totalPriests)) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="dashboard-system-overview-item">
                    <Text>Priest Ratio</Text>
                    <Text strong>
                      {stats.totalPriests > 0
                        ? ((stats.totalPriests / (stats.totalUsers + stats.totalPriests)) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card
          title={<Title level={4} className="dashboard-system-overview-title">Calendar</Title>}
          className="dashboard-system-overview-card"
        >
          <CustomCalendar events={calendarEvents} onEventClick={handleBookingClick} />
        </Card>
      </div>

      <Modal
        title={selectedBooking ? selectedBooking.bookingName : "Booking Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {renderBookingDetails()}
      </Modal>

      {/* Donation Report */}
      <ReportTemplate
        title={<span className="report-template-title">Donation Report</span>}
        columns={donationColumns}
        data={donationReportData}
        reportType="donation"
      />

      {/* Booking Report */}
      <ReportTemplate
        title={<span className="report-template-title">Booking Report</span>}
        columns={bookingColumns}
        data={bookingReportData}
        reportType="booking"
      />

      {/* System Overview Report */}
      <ReportTemplate
        title={<span className="report-template-title">System Overview Report</span>}
        columns={systemOverviewColumns}
        data={systemReportData}
        reportType="system"
      />

    </div>
  );
}
