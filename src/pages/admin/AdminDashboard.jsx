import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Statistic, Button, Space, Tag, Typography, Spin, Empty, Calendar, Modal } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
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

const PesoIcon = ({ style }) => (
  <span style={{ ...style, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>₱</span>
);

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
  const [monthlyDonationsData, setMonthlyDonationsData] = useState([]);
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
  }, []);

  const generateAIAnalysis = (donationsData = null, bookingsData = null, currentStatsData = null, monthlyDataArray = null) => {
    try {
      setLoadingAI(true);

      const donations = donationsData !== null ? donationsData : donationReportData;
      const bookings = bookingsData !== null ? bookingsData : bookingReportData;
      const currentStats = currentStatsData !== null ? currentStatsData : stats;

      const totalDonations = donations.length;
      const totalDonationAmount = currentStats.totalDonations || 0;
      const avgDonation = totalDonations > 0 ? totalDonationAmount / totalDonations : 0;

      const donationsByPaymentMethod = {};
      donations.forEach(donation => {
        const method = donation.paymentMethod || "Unknown";
        donationsByPaymentMethod[method] = (donationsByPaymentMethod[method] || 0) + 1;
      });

      const donationsByMonth = {};
      donations.forEach(donation => {
        if (donation.date) {
          const month = dayjs(donation.date).format("YYYY-MM");
          donationsByMonth[month] = (donationsByMonth[month] || 0) + 1;
        }
      });

      const recentMonths = Object.keys(donationsByMonth).sort().slice(-6);
      const trend = recentMonths.length >= 2
        ? (donationsByMonth[recentMonths[recentMonths.length - 1]] > donationsByMonth[recentMonths[recentMonths.length - 2]] ? "increasing" : "decreasing")
        : "stable";

      const bookingsByType = {};
      const bookingsByStatus = {};
      const bookingsByMonth = {};

      bookings.forEach(booking => {
        const type = booking.bookingType || "Unknown";
        bookingsByType[type] = (bookingsByType[type] || 0) + 1;

        const status = booking.status || "pending";
        bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;

        if (booking.date) {
          const month = dayjs(booking.date).format("YYYY-MM");
          bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
        }
      });

      let insights = "";

      insights += "💰 DONATION SUMMARY\n";
      insights += `• Total of ${totalDonations} donations amounting to ₱${totalDonationAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, with an average of ₱${avgDonation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per donation and ₱${currentStats.monthlyDonations.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month.\n\n`;

      insights += "📈 DONATIONS OVER TIME\n";
      if (recentMonths.length > 0) {
        const trendText = trend === "increasing" ? "increasing" : trend === "decreasing" ? "decreasing" : "stable";
        const recentTotal = recentMonths.reduce((sum, month) => sum + (donationsByMonth[month] || 0), 0);
        insights += `• Donation trend shows ${trendText} activity with ${recentTotal} donation${recentTotal !== 1 ? "s" : ""} across the last ${recentMonths.length} month${recentMonths.length !== 1 ? "s" : ""}.\n\n`;

      } else {
        insights += "• No donation timeline data available yet.\n\n";
      }

      insights += "💳 DONATIONS BY PAYMENT METHOD\n";
      const sortedPaymentMethods = Object.entries(donationsByPaymentMethod)
        .sort((a, b) => b[1] - a[1]);
      if (sortedPaymentMethods.length > 0) {
        const topMethod = sortedPaymentMethods[0];
        const topPercentage = ((topMethod[1] / totalDonations) * 100).toFixed(1);
        const otherMethods = sortedPaymentMethods.slice(1).map(([method, count]) => {
          const percentage = ((count / totalDonations) * 100).toFixed(1);
          return `${method} (${percentage}%)`;
        }).join(", ");

        if (otherMethods) {
          insights += `• ${topMethod[0]} is the most popular payment method at ${topPercentage}%, followed by ${otherMethods}.\n\n`;

        } else {
          insights += `• All donations are processed through ${topMethod[0]} (100%).\n\n`;
        }

      } else {
        insights += "• No payment method data available.\n\n";
      }

      insights += "📅 BOOKINGS BY TYPE\n";
      const sortedBookingTypes = Object.entries(bookingsByType)
        .sort((a, b) => b[1] - a[1]);

      if (sortedBookingTypes.length > 0) {
        const totalBookings = bookings.length;
        const topType = sortedBookingTypes[0];
        const topPercentage = totalBookings > 0 ? ((topType[1] / totalBookings) * 100).toFixed(1) : 0;
        const otherTypes = sortedBookingTypes.slice(1).map(([type, count]) => {
          const percentage = totalBookings > 0 ? ((count / totalBookings) * 100).toFixed(1) : 0;
          return `${type} (${percentage}%)`;
        }).join(", ");

        if (otherTypes) {
          insights += `• ${topType[0]} leads with ${topPercentage}% of bookings, followed by ${otherTypes}.\n\n`;

        } else {
          insights += `• All bookings are for ${topType[0]} (100%).\n\n`;
        }

      } else {
        insights += "• No booking type data available.\n\n";
      }

      insights += "📋 BOOKINGS BY STATUS\n";
      const statusOrder = { "confirmed": 1, "pending": 2, "cancelled": 3, "rejected": 4 };
      const sortedStatuses = Object.entries(bookingsByStatus)
        .sort((a, b) => (statusOrder[a[0].toLowerCase()] || 999) - (statusOrder[b[0].toLowerCase()] || 999));

      if (sortedStatuses.length > 0) {
        const totalBookings = bookings.length;
        const statusSummary = sortedStatuses.map(([status, count]) => {
          const percentage = totalBookings > 0 ? ((count / totalBookings) * 100).toFixed(1) : 0;
          return `${status.charAt(0).toUpperCase() + status.slice(1)} (${percentage}%)`;
        }).join(", ");
        insights += `• Booking status distribution: ${statusSummary}.\n\n`;

      } else {
        insights += "• No booking status data available.\n\n";
      }

      insights += "⏱️ BOOKINGS OVER TIME\n";
      const bookingMonths = Object.keys(bookingsByMonth).sort().slice(-6);

      if (bookingMonths.length > 0) {
        const recentBookingTotal = bookingMonths.reduce((sum, month) => sum + (bookingsByMonth[month] || 0), 0);
        const latestMonth = bookingMonths[bookingMonths.length - 1];
        const latestCount = bookingsByMonth[latestMonth] || 0;
        insights += `• Recent booking activity shows ${recentBookingTotal} booking${recentBookingTotal !== 1 ? "s" : ""} across ${bookingMonths.length} month${bookingMonths.length !== 1 ? "s" : ""}, with ${latestCount} booking${latestCount !== 1 ? "s" : ""} in ${dayjs(latestMonth).format("MMM YYYY")}.\n\n`;

      } else {
        insights += "• No booking timeline data available.\n\n";
      }

      insights += "💡 RECOMMENDATIONS FOR FUTURE\n";
      if (currentStats.pendingBookings > 5) {
        insights += `• ⚠️ High number of pending bookings (${currentStats.pendingBookings}) - Consider reviewing and processing them promptly\n`;
      }

      if (trend === "decreasing" && recentMonths.length >= 3) {
        insights += "• 📉 Donation trend is decreasing - Consider launching donation campaigns or events\n";
      }

      if (sortedPaymentMethods.length > 0 && sortedPaymentMethods[0][0] !== "GCash") {
        insights += "• 💳 Consider promoting GCash or digital payment methods for easier transactions\n";
      }

      const mostPopularBookingType = sortedBookingTypes[0];
      if (mostPopularBookingType) {
        insights += `• 📌 ${mostPopularBookingType[0]} is the most requested service - Consider optimizing availability\n`;
      }
      if (avgDonation < 500) {
        insights += "• 💰 Average donation amount is relatively low - Consider setting suggested donation amounts\n";
      }
      if (bookings.length > 0) {
        const pendingRate = (bookingsByStatus["pending"] || 0) / bookings.length;
        if (pendingRate > 0.3) {
          insights += "• ⏳ High pending booking rate - Review and streamline the approval process\n";
        }
      }

      if (insights.endsWith("\n\n")) {
        insights += "• Continue monitoring trends and adjust strategies based on data patterns\n";
      }

      setAiAnalysis(insights);

    } catch (error) {
      console.error("Error generating AI analysis:", error);
      setAiAnalysis("Unable to generate AI analysis at this time.");
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchAIAnalysis = () => {
    generateAIAnalysis();
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

      const bookingData = allBookings.map((b) => ({
        bookingName: getBookingName(b),
        bookingType: b.bookingType,
        status: b.status || "pending",
        date: b.date,
        contact_number: b.contact_number,
      }));

      const donationData = (donationsListRes?.data?.donations || []).map((d, i) => ({
        id: d._id || i,
        donor_name: d.user_name || "N/A",
        email: d.user_email || "N/A",
        amount: d.amount || 0,
        paymentMethod: d.paymentMethod || "N/A",
        date: d.createdAt || "",
        transaction_id: d._id || "N/A",
      }));

      const currentStats = {
        totalUsers: users.filter((u) => !u.is_priest).length,
        totalPriests: priests.length,
        pendingBookings: pendingBookingsCount,
        totalDonations: allDonationsRes?.data?.stats?.amounts?.total || 0,
        monthlyDonations: monthlyDonationRes?.data?.totalAmount || 0,
        totalVolunteers: 0,
        recentUsers: recentUsers,
      };

      setBookingReportData(bookingData);
      setDonationReportData(donationData);
      setStats(currentStats);
      setMonthlyDonationsData(monthlyDonationRes?.data?.monthlyDonations || []);

      setSystemReportData([
        { metric: "Total Users", value: currentStats.totalUsers },
        { metric: "Total Priests", value: currentStats.totalPriests },
        { metric: "Total Donations", value: currentStats.totalDonations },
        { metric: "Pending Bookings", value: currentStats.pendingBookings },
      ]);

      generateAIAnalysis(donationData, bookingData, currentStats, monthlyDonationRes?.data?.monthlyDonations || []);

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
      icon: <PesoIcon style={{ fontSize: 32, color: "#52c41a" }} />,
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
                  className="border-btn"
                  style={{ padding: '15px 10px' }}
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
              <Title level={2} className="dashboard-title">Welcome Back, {user?.first_name || "Admin"}!</Title>
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
                  prefix={<UserOutlined style={{ marginRight: 8 }} />}
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
                prefix={<TeamOutlined style={{ marginRight: 8 }} />}
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
                prefix={<CalendarOutlined style={{ marginRight: 8 }} />}
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
                  prefix={<PesoIcon style={{ marginRight: 8, fontSize: 16 }} />}
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
        {/* <Card title={<Title level={4} className="dashboard-quick-actions-title">Quick Actions</Title>} className="dashboard-quick-actions-card">
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
        </Card> */}

        {/* AI Stats Analysis with System Overview Report and System Overview - Side by Side */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
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
                <div
                  style={{
                    padding: "20px",
                    background: "#fafafa",
                    borderRadius: "12px",
                    fontSize: "15px",
                    lineHeight: 1.7,
                    height: "500px",
                    overflowY: "auto",
                    color: "#333",
                  }}
                >
                  {aiAnalysis.split("\n").map((line, index) => {
                    const isHeader = /^[📈💳📅📋⏱️💡]/.test(line);

                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom: isHeader ? 12 : 6,
                          fontWeight: isHeader ? 600 : 400,
                          fontSize: isHeader ? "16px" : "15px",
                        }}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty description="No AI analysis available" />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <ReportTemplate
                title={<span className="report-template-title">System Overview Report</span>}
                columns={systemOverviewColumns}
                data={systemReportData}
                reportType="system"
              />
              <Card title={<Title level={4} className="dashboard-system-overview-title">System Overview</Title>} className="dashboard-system-overview-card">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={12}>
                    <div className="dashboard-system-overview-item">
                      <Text>System Status</Text>
                      <Tag color="success">Operational</Tag>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={12}>
                    <div className="dashboard-system-overview-item">
                      <Text>Total Accounts</Text>
                      <Text strong>{stats.totalUsers + stats.totalPriests}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={12}>
                    <div className="dashboard-system-overview-item">
                      <Text>User Ratio</Text>
                      <Text strong>
                        {stats.totalUsers > 0
                          ? ((stats.totalUsers / (stats.totalUsers + stats.totalPriests)) * 100).toFixed(1)
                          : 0}%
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} lg={12}>
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
            </div>
          </Col>
        </Row>

        {/* System Overview */}
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

      {/* Donation Report and Booking Report - Side by Side */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ReportTemplate
            title={<span className="report-template-title">Donation Report</span>}
            columns={donationColumns}
            data={donationReportData}
            reportType="donation"
          />
        </Col>
        <Col xs={24} lg={12}>
          <ReportTemplate
            title={<span className="report-template-title">Booking Report</span>}
            columns={bookingColumns}
            data={bookingReportData}
            reportType="booking"
          />
        </Col>
      </Row>
    </div>
  );
}
