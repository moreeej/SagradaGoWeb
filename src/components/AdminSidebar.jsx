import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { Layout, Menu, Button, Badge, Modal } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined, BookOutlined, DollarOutlined, TeamOutlined, CalendarOutlined, NotificationOutlined, MessageOutlined, FileTextOutlined } from "@ant-design/icons";
import { NavbarContext } from "../context/AllContext";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../Constants";
import Logo from "../assets/sagrada.png";
import "../styles/adminSidebar.css";

const { Sider } = Layout;

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useContext(NavbarContext);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("currentUser")) || null;

  useEffect(() => {
    fetchNotificationUnreadCount();
    fetchChatUnreadCount();
    const interval = setInterval(() => {
      fetchNotificationUnreadCount();
      fetchChatUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationUnreadCount = async () => {
    try {
      if (!user?.uid) return;

      const response = await axios.post(`${API_URL}/getNotifications`, {
        recipient_id: user.uid,
        recipient_type: "admin",
        limit: 1,
      });

      if (response.data) {
        setNotificationUnreadCount(response.data.unreadCount || 0);
      }
      
    } catch (error) {
      console.error("Error fetching notification unread count:", error);
    }
  };

  const fetchChatUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/getAllChats`);
      const fetchedChats = response.data.chats || [];
      
      const totalUnread = fetchedChats.reduce(
        (sum, chat) => sum + (chat.unreadCount || 0),
        0
      );
      setChatUnreadCount(totalUnread);
      
    } catch (error) {
      console.error("Error fetching chat unread count:", error);
    }
  };

  const menuItems = [
    {
      key: "/admin/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/account-management",
      icon: <UserOutlined />,
      label: "Account Management",
    },
    {
      key: "/admin/bookings",
      icon: <BookOutlined />,
      label: "Bookings",
    },
    {
      key: "/admin/donations",
      icon: <DollarOutlined />,
      label: "Donations",
    },
    {
      key: "/admin/volunteers",
      icon: <TeamOutlined />,
      label: "Volunteers",
    },
    {
      key: "/admin/events",
      icon: <CalendarOutlined />,
      label: "Events",
    },
    {
      key: "/admin/announcements",
      icon: <NotificationOutlined />,
      label: "Announcements",
    },
    {
      key: "/admin/logs",
      icon: <FileTextOutlined />,
      label: "Activity Logs",
    },
    {
      key: "/admin/notifications",
      icon: <NotificationOutlined />,
      label: (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Notifications</span>
          {notificationUnreadCount > 0 && (
            <Badge
              count={notificationUnreadCount}
              style={{
                backgroundColor: "#b87d3e",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "/admin/chat",
      icon: <MessageOutlined />,
      label: (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Chat</span>
          {chatUnreadCount > 0 && (
            <Badge
              count={chatUnreadCount}
              style={{
                backgroundColor: "#b87d3e",
              }}
            />
          )}
        </span>
      ),
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    Cookies.remove("email");
    setCurrentUser({});
    navigate("/");
    window.location.reload();
  };

  return (
    <Sider className="admin-sider" width={260}>
      {/* Logo */}
      <div className="admin-logo" onClick={() => navigate("/admin/dashboard")}>
        <img src={Logo} alt="Logo" />
        <div>
          <h2>Sagrada Familia</h2>
        </div>
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="custom-admin-menu"
      />

      {/* Logout */}
      <div className="admin-logout">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          block
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      {/* Download App Box */}
      {/* <div className="admin-download-app">
        <div className="download-title">Download our mobile app</div>
        <div className="download-subtitle">
          Get faster access on your phone!
        </div>
        <Button type="primary" block className="download-btn">
          Download
        </Button>
      </div> */}

      {/* Logout Confirmation Modal */}
      <Modal
        open={showLogoutModal}
        title="Confirm Logout"
        onCancel={() => setShowLogoutModal(false)}
        onOk={handleLogoutConfirm}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </Sider>
  );
}