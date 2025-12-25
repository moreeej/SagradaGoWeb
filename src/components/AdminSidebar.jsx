import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { Layout, Menu, Button, Badge } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined, BookOutlined, DollarOutlined, TeamOutlined, CalendarOutlined, NotificationOutlined, MessageOutlined, BellOutlined } from "@ant-design/icons";
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
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("currentUser")) || null;

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      if (!user?.uid) return;

      const response = await axios.post(`${API_URL}/getNotifications`, {
        recipient_id: user.uid,
        recipient_type: "admin",
        limit: 1,
      });

      if (response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
      
    } catch (error) {
      console.error("Error fetching unread count:", error);
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
      key: "/admin/notifications",
      icon: <BellOutlined />,
      label: (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge
              count={unreadCount}
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
      label: "Chat",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
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
      <div className="admin-download-app">
        <div className="download-title">Download our mobile app</div>
        <div className="download-subtitle">
          Get faster access on your phone!
        </div>
        <Button type="primary" block className="download-btn">
          Download
        </Button>
      </div>
    </Sider>
  );
}