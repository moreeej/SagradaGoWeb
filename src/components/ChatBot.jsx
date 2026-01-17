import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../Constants";
import Cookies from "js-cookie";

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const uid = Cookies.get("uid");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null; // Don't render if closed

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat/ai/response`, {
        userId: uid,
        message: userMessage.text,
      });
      const aiMessage = { role: "ai", text: res.data.message };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I'm having trouble connecting. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    floatingWrapper: {
      position: "fixed",
      bottom: "90px",
      right: "24px",
      width: "360px",
      zIndex: 2000,
      boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
      borderRadius: "16px",
      overflow: "hidden",
      backgroundColor: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      border: "1px solid #eaeaea",
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
    },
    headerInfo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    statusDot: {
      width: "8px",
      height: "8px",
      backgroundColor: "#22c55e",
      borderRadius: "50%",
    },
    closeBtn: {
      background: "none",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
      color: "#999",
      padding: "4px",
    },
    chatArea: {
      height: "400px",
      overflowY: "auto",
      padding: "15px",
      backgroundColor: "#f9f9f9",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    messageRow: (role) => ({
      display: "flex",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
      width: "100%",
      textAlign: 'justify'
    }),
    bubble: (role) => ({
      maxWidth: "80%",
      padding: "10px 14px",
      fontSize: "13px",
      lineHeight: "1.4",
      borderRadius: "15px",
      backgroundColor: role === "user" ? "#000" : "#fff",
      color: role === "user" ? "#fff" : "#333",
      borderBottomRightRadius: role === "user" ? "2px" : "15px",
      borderBottomLeftRadius: role === "ai" ? "2px" : "15px",
      border: role === "ai" ? "1px solid #eee" : "none",
    }),
    inputContainer: {
      padding: "15px",
      borderTop: "1px solid #eee",
      backgroundColor: "#fff",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    inputField: {
      width: "100%",
      padding: "10px 45px 10px 15px",
      backgroundColor: "#f0f0f0",
      border: "none",
      borderRadius: "20px",
      fontSize: "13px",
      outline: "none",
    },
    sendButton: {
      position: "absolute",
      right: "5px",
      padding: "6px",
      backgroundColor: "#000",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: loading || !input.trim() ? 0.3 : 1,
    }
  };

  return (
    <div style={styles.floatingWrapper}>
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.statusDot}></div>
          <div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>SagradaBot</h3>
            <p style={{ margin: 0, fontSize: "10px", color: "#22c55e" }}>Online</p>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>&times;</button>
      </div>

      <div ref={scrollRef} style={styles.chatArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "40px", color: "#aaa" }}>
            <p style={{ fontSize: "12px" }}>Hello! How can I help you today?</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} style={styles.messageRow(msg.role)}>
            <div style={styles.bubble(msg.role)}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={styles.messageRow("ai")}>
            <span style={{ color: "#999", fontSize: "11px", marginLeft: "10px" }}>Typing...</span>
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            style={styles.inputField}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={styles.sendButton}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}