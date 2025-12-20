import { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { Layout, List, Input, Button, Badge, Avatar, Typography, message, Card, Empty } from "antd";
import { MessageOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { API_URL } from "../Constants";
import { NavbarContext } from "../context/AllContext";
import axios from "axios";
import "../styles/adminChat.css";

const { Content, Sider } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

export default function AdminChat() {
  const { currentUser } = useContext(NavbarContext);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    let API_BASE = API_URL;
    if (API_BASE.endsWith("/api")) {
      API_BASE = API_BASE.replace("/api", "");
    }

    const newSocket = io(API_BASE, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");

      newSocket.emit("join-room", {
        userId: currentUser?.uid || "admin",
        userType: "admin",
        userName: `${currentUser?.first_name || "Admin"} ${currentUser?.last_name || ""}`,
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    newSocket.on("chat-list", ({ chats }) => {
      setChats(chats || []);
      const totalUnread = chats?.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0) || 0;
      setUnreadCount(totalUnread);
    });

    newSocket.on("receive-message", ({ message }) => {
      if (selectedChat && selectedChat.userId === message.senderId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    newSocket.on("new-message", ({ chat, message }) => {
      setChats((prevChats) => {
        const updatedChats = prevChats.map((c) =>
          c.userId === chat.userId ? chat : c
        );

        const chatIndex = updatedChats.findIndex((c) => c.userId === chat.userId);
        if (chatIndex > 0) {
          const [chatToMove] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(chatToMove);
        }

        return updatedChats;
      });

      if (selectedChat && selectedChat.userId === chat.userId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    newSocket.on("selected-chat", ({ chat }) => {
      if (chat) {
        setSelectedChat(chat);
        setMessages(chat.messages || []);
        scrollToBottom();

        if (chat.unreadCount > 0) {
          markAsRead(chat.userId);
        }
      }
    });

    newSocket.on("error", ({ message: errorMessage }) => {
      message.error(errorMessage || "An error occurred");
    });

    setSocket(newSocket);

    fetchChats();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/getAllChats`);
      setChats(response.data.chats || []);

      const totalUnread = response.data.chats?.reduce(
        (sum, chat) => sum + (chat.unreadCount || 0),
        0
      ) || 0;
      setUnreadCount(totalUnread);

    } catch (error) {
      console.error("Error fetching chats:", error);
      message.error("Failed to load chats");
    }
  };

  const handleSelectChat = (chat) => {
    if (socket) {
      socket.emit("select-chat", { userId: chat.userId });
    }
  };

  const markAsRead = async (userId) => {
    try {
      await axios.post(`${API_URL}/chat/markAsRead`, { userId });
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.userId === userId ? { ...c, unreadCount: 0 } : c
        )
      );

    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedChat || !socket) return;

    const messageData = {
      userId: selectedChat.userId,
      message: inputMessage.trim(),
      senderId: currentUser?.uid || "admin",
      senderType: "admin",
      senderName: `${currentUser?.first_name || "Admin"} ${currentUser?.last_name || ""}`,
    };

    socket.emit("send-message", messageData);
    setInputMessage("");
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    } else if (days === 1) {
      return "Yesterday";

    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return "No messages yet";
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message.length > 50
      ? lastMsg.message.substring(0, 50) + "..."
      : lastMsg.message;
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1550px", margin: "0 auto" }}>
        <Layout
          style={{
            background: "#f0f2f5",
            borderRadius: "8px",
            overflow: "hidden",
            minHeight: "95vh",
          }}
        >
          <Sider
            width={320}
            style={{
              background: "#fff",
              borderRight: "1px solid #e8e8e8",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "16px", borderBottom: "1px solid #e8e8e8" }}>
              <Text strong style={{ fontSize: "18px" }}>Chats</Text>
              {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: "8px" }} />}
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {chats.length === 0 ? (
                <Empty description="No active chats" style={{ marginTop: "50px" }} />
              ) : (
                <List
                  dataSource={chats}
                  renderItem={(chat) => (
                    <List.Item
                      style={{
                        cursor: "pointer",
                        padding: "12px 16px",
                        backgroundColor: selectedChat?.userId === chat.userId ? "#e6f7ff" : "transparent",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                      onClick={() => handleSelectChat(chat)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={chat.unreadCount || 0} offset={[-5, 5]}>
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#b87d3e" }} />
                          </Badge>
                        }
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text strong>{chat.userName}</Text>
                            {chat.lastMessage && <Text type="secondary" style={{ fontSize: "12px" }}>{formatTime(chat.lastMessage)}</Text>}
                          </div>
                        }
                        description={
                          <Text ellipsis style={{ color: chat.unreadCount > 0 ? "#000" : "#8c8c8c", fontWeight: chat.unreadCount > 0 ? 500 : 400 }}>
                            {getLastMessage(chat)}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Sider>

          {/* Main chat area */}
          <Content style={{ display: "flex", flexDirection: "column", background: "#f0f2f5" }}>
            {selectedChat ? (
              <>
                {/* Header */}
                <div style={{ padding: "16px", borderBottom: "1px solid #e8e8e8", background: "#fff" }}>
                  <Text strong>{selectedChat.userName}</Text>
                </div>

                {/* Messages container */}
                <div
                  ref={messagesContainerRef}
                  style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#fafafa" }}
                >
                  {messages.length === 0 ? (
                    <Empty description="No messages yet. Start the conversation!" />
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: msg.senderType === "admin" ? "flex-end" : "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <Card
                          style={{
                            maxWidth: "70%",
                            background: msg.senderType === "admin" ? "#b87d3e" : "#fff",
                            border: msg.senderType === "admin" ? "none" : "1px solid #e8e8e8",
                            borderRadius: "8px",
                          }}
                          bodyStyle={{ padding: "8px 12px" }}
                        >
                          <Text style={{ color: msg.senderType === "admin" ? "#fff" : "#000", fontSize: "14px" }}>
                            {msg.message}
                          </Text>
                          <div style={{ fontSize: "11px", color: msg.senderType === "admin" ? "rgba(255,255,255,0.7)" : "#8c8c8c", marginTop: "4px" }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </Card>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input box */}
                <div style={{ padding: "16px", borderTop: "1px solid #e8e8e8", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <TextArea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendMessage}
                      disabled={!inputMessage.trim()}
                      style={{ background: "#b87d3e", borderColor: "#b87d3e" }}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  flexDirection: "column",
                }}
              >
                <MessageOutlined style={{ fontSize: "64px", color: "#d9d9d9" }} />
                <Text type="secondary" style={{ marginTop: "16px", fontSize: "16px", fontFamily: 'Poppins' }}>
                  Select a chat to start messaging
                </Text>
              </div>
            )}
          </Content>
        </Layout>
      </div>
    </div>
  );
}

