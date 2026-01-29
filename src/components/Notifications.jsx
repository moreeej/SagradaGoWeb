import { useState, useEffect } from "react";
import { Card, List, Badge, Typography, Button, Empty, Spin, Space, Tabs, Modal } from "antd";
import {
  NotificationOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../Constants";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const user = JSON.parse(localStorage.getItem("currentUser")) || null;

  useEffect(() => {c
    window.scrollTo(0, 0);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!user?.uid) {
        console.warn("Notifications: No user UID found in localStorage");
        setLoading(false);
        return;
      }

      console.log("Notifications: Fetching for admin UID:", user.uid);

      const response = await axios.post(`${API_URL}/getNotifications`, {
        recipient_id: user.uid,
        recipient_type: "admin",
        limit: 100,
      });

      console.log("Notifications: Response received:", response.data);

      if (response.data) {
        const transformedNotifications = (response.data.notifications || []).map((n) => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          time: dayjs(n.createdAt),
          read: n.read || false,
          action: n.action || null,
        }));

        console.log("Notifications: Transformed notifications:", transformedNotifications);
        console.log("Notifications: Unread count:", response.data.unreadCount || 0);

        setNotifications(transformedNotifications);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_URL}/markAsRead`, { notification_id: notificationId });
      setNotifications(prev =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      // setUnreadCount(Math.max(0, unreadCount - 1));
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!user?.uid) return;

      setMarkingAsRead(true);
      await axios.post(`${API_URL}/markAllAsRead`, {
        recipient_id: user.uid,
        recipient_type: "admin",
      });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

    } catch (error) {
      console.error("Error marking all as read:", error);

    } finally {
      setMarkingAsRead(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      booking: <BookOutlined />,
      donation: <DollarOutlined />,
      donation_status: <DollarOutlined />,
      volunteer: <UserOutlined />,
      event: <CalendarOutlined />,
      user: <UserOutlined />,
    };
    return icons[type] || <NotificationOutlined />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking: "#1890ff",
      donation: "#52c41a",
      donation_status: "#52c41a",
      volunteer: "#fa8c16",
      event: "#722ed1",
      user: "#fa8c16",
    };
    return colors[type] || "#b87d3e";
  };

  const renderNotificationList = (data) => (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(n) => (
        <List.Item
          className="notification-item"
          style={{
            backgroundColor: n.read ? "#fff" : "#fffbf0",
            borderLeft: n.read ? "4px solid transparent" : "4px solid #b87d3e",
            padding: "16px",
            marginBottom: "8px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onClick={() => handleNotificationClick(n)}
        >
          <List.Item.Meta
            avatar={
              <div style={{
                width: 45, height: 45, borderRadius: "50%",
                backgroundColor: `${getNotificationColor(n.type)}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: getNotificationColor(n.type), fontSize: 20
              }}>
                {getNotificationIcon(n.type)}
              </div>
            }
            title={
              <Space>
                <Text strong={!n.read} style={{ fontSize: 16, fontFamily: 'Poppins' }}>{n.title}</Text>
                {!n.read && <Badge status="processing" color="#b87d3e" />}
              </Space>
            }
            description={
              <div>
                <Text type="secondary" ellipsis style={{ display: 'block', maxWidth: '800px', fontFamily: "'Poppins', sans-serif" }}>{n.message}</Text>
                <Text type="secondary" style={{ fontSize: 12, fontFamily: "'Poppins', sans-serif" }}>{n.time.format("MMM DD, YYYY • h:mm A")}</Text>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  const tabItems = [
    {
      key: '1',
      label: `All Notifications`,
      children: renderNotificationList(notifications),
    },
    {
      key: '2',
      label: `Unread (${unreadCount})`,
      children: renderNotificationList(notifications.filter(n => !n.read)),
    },
    {
      key: '3',
      label: `Read`,
      children: renderNotificationList(notifications.filter(n => n.read)),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: "95%", margin: "0 auto", marginTop: 25 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontFamily: "Poppins", fontWeight: 600 }}>Notifications</Title>
            <Text type="secondary" style={{ fontFamily: "Poppins" }}>
              {unreadCount > 0 ? `Manage your ${unreadCount} new alerts` : "You're all caught up!"}
            </Text>
          </div>
          {unreadCount > 0 && (
            <Button
              className="border-btn"
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAllAsRead}
              loading={markingAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>
          ) : (
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              style={{ fontFamily: 'Poppins' }}
              tabBarStyle={{ marginBottom: 20 }}
            />
          )}
        </Card>

        <Modal
          title={<Space><InfoCircleOutlined style={{ color: '#b87d3e' }} /> <span style={{ fontFamily: 'Poppins', fontWeight: 400 }}>Notification Details</span></Space>}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          centered
        >
          {selectedNotification && (
            <div style={{ padding: '10px 0', fontFamily: 'Poppins' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  padding: '10px', borderRadius: '8px',
                  backgroundColor: `${getNotificationColor(selectedNotification.type)}15`,
                  color: getNotificationColor(selectedNotification.type)
                }}>
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <Title level={4} style={{ margin: 0, fontFamily: 'Poppins' }}>{selectedNotification.title}</Title>
              </div>
              <Text style={{ fontSize: '16px', color: '#434343', display: 'block', marginBottom: '20px', fontFamily: "'Poppins', sans-serif" }}>
                {selectedNotification.message}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px', fontFamily: "'Poppins', sans-serif" }}>
                Received on {selectedNotification.time.format("MMMM DD, YYYY [at] h:mm A")}
              </Text>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
