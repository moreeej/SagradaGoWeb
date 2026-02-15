import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../Constants";
import Cookies from "js-cookie";
import { message } from "antd";

// Same as backend AIService SYSTEM_PROMPT - used when calling Gemini from browser (works on Render)
const SAGRADABOT_SYSTEM_PROMPT = `You are SagradaBot, a helpful AI assistant for the Sagrada Familia Parish Information System. You help parishioners with information about the parish and its services.

**SACRAMENTS AND BOOKING INFORMATION:**
1. Wedding - Min booking: Oct 17, 2025. Requirements: Marriage license, Baptismal/Confirmation certs, Pre-marriage seminar, Parental consent if applicable.
2. Baptism - Min booking: Nov 1, 2025. Requirements: Birth cert, Parent marriage cert, Godparent confirmation cert, Baptismal seminar.
3. Confession - Min booking: Sep 19, 2025. Requirements: Contrite heart, examination of conscience.
4. Anointing of the Sick - Min booking: Sep 18, 2025. Requirements: Medical cert if applicable, family/guardian present.
5. First Communion - Min booking: Nov 16, 2025. Requirements: Baptismal cert, preparation completion, parent consent, catechism attendance.
6. Burial - Min booking: Sep 20, 2025. Requirements: Death cert, Baptismal cert of deceased, family contact, preferred date/time.
7. Confirmation - Min booking: Nov 16, 2025. Requirements: Baptismal, First Communion cert, preparation, sponsor confirmation cert, catechism attendance.

**OTHER:** Donations/Events/Volunteering in app; Virtual Tour 360° in app.
**GUIDELINES:** Friendly, respectful, Christian tone. Accurate info. If unsure, direct to parish office or "Chat with Admin". Concise. 🙏 sparingly.`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputBot, setInputBot] = useState("");

  const [adminMessages, setAdminMessages] = useState([]);
  const [inputAdmin, setInputAdmin] = useState("");

  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [chatBotMode, setChatBotMode] = useState(true);

  const [chatAdminHistory, setChatAdminHistory] = useState([]);

  const chatbotContainerRef = useRef(null);

  const uid = Cookies.get("uid");
  const fullname = Cookies.get("fullname");

  async function fetchAdminChatHistory() {
    if (!uid || !API_URL) return;
    try {
      const res = await axios.get(`${API_URL}/chat/getChatByUserId/${uid}`);
      setChatAdminHistory(res.data?.chat?.messages ?? []);
    } catch (err) {
      if (err.response?.status === 404) {
        setChatAdminHistory([]);
      } else {
        console.error(err.response?.data || err.message);
      }
    }
  }

  useEffect(() => {
    fetchAdminChatHistory();
  }, [uid]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        chatbotContainerRef.current &&
        !chatbotContainerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const getMessageRole = (msg) => {
    if (msg.senderType === "admin") return "ai";
    if (msg.senderType === "user") return "user";
    return msg.role || "user";
  };

  const sendMessage = async () => {
    if (!inputBot.trim() || loading) return;
    if (!uid) {
      message.warning("Please sign in to use the AI chat.");
      return;
    }
    const userMessage = { role: "user", text: inputBot.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputBot("");
    setLoading(true);

    try {
      if (GEMINI_API_KEY) {
        const history = await fetchAIChatHistory();
        const fullPrompt = buildPromptForGemini(history, userMessage.text);
        const aiText = await callGeminiFromBrowser(fullPrompt);
        if (API_URL) {
          await axios.post(`${API_URL}/chat/ai/response`, {
            userId: uid,
            message: userMessage.text,
            response: aiText,
          });
        }
        setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
        return;
      }

      if (!API_URL) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Chat service is not configured. Please try again later." },
        ]);
        return;
      }

      const res = await axios.post(`${API_URL}/chat/ai/response`, {
        userId: uid,
        message: userMessage.text,
      });
      const aiMessage = { role: "ai", text: res.data?.message ?? "No response." };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const status = error.response?.status;
      const is404 = status === 404;
      const is500 = status === 500;
      const isNetwork = error.code === "ERR_NETWORK";
      let friendlyMsg = "I'm having trouble connecting. Please try again later.";
      if (is404 || isNetwork) {
        friendlyMsg = "Chat service is temporarily unavailable. Please try again in a few moments.";
      } else if (is500) {
        friendlyMsg = "AI service is temporarily unavailable. Please try again later or use Chat with Admin.";
      }
      setMessages((prev) => [...prev, { role: "ai", text: friendlyMsg }]);
    } finally {
      setLoading(false);
    }
  };

  async function fetchAIChatHistory() {
    if (!API_URL || !uid) return [];
    try {
      const res = await axios.post(`${API_URL}/chat/ai/history`, { userId: uid });
      return res.data?.history ?? [];
    } catch {
      return [];
    }
  }

  function buildPromptForGemini(history, newMessage) {
    let full = SAGRADABOT_SYSTEM_PROMPT + "\n\n";
    (history || []).slice(-10).forEach((msg) => {
      if (msg.role === "user") full += `User: ${msg.content}\n`;
      else if (msg.role === "assistant") full += `Assistant: ${msg.content}\n`;
    });
    full += `User: ${newMessage}\nAssistant:`;
    return full;
  }

  async function callGeminiFromBrowser(fullPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err?.error?.message || res.statusText || "AI request failed";
      throw new Error(errMsg);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from AI");
    return text;
  }

  async function sendAdminMessage() {
    if (!inputAdmin.trim() || loading) return;

    if (!uid) {
      message.error("Admin not authenticated");
      return;
    }

    const adminMessage = {
      role: "user",
      senderId: uid,
      senderType: "user",
      senderName: fullname,
      message: inputAdmin.trim(),
      text: inputAdmin.trim(),
    };

    setAdminMessages((prev) => [...prev, adminMessage]);

    setInputAdmin("");

    try {
      const res = await axios.post(`${API_URL}/chat/addMessageWeb`, {
        userId: uid,
        senderId: uid,
        senderType: "user",
        senderName: fullname,
        message: inputAdmin.trim(),
      });

      console.log("Updated chat:", res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      message.error("Failed to send message");
    }
  }

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
      textAlign: "justify",
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
      opacity: loading || !inputBot.trim() ? 0.3 : 1,
    },
  };

  return (
    /* 3. Attach the ref to the wrapper */
    <div ref={chatbotContainerRef} style={styles.floatingWrapper}>
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.statusDot}></div>
          <div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
              SagradaBot
            </h3>
            <p style={{ margin: 0, fontSize: "10px", color: "#22c55e" }}>
              Online
            </p>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="w-full h-10 bg-gray-200 rounded-full flex p-1">
        <button
          className={`w-1/2 h-full rounded-full text-sm font-medium transition-all duration-300
            ${chatBotMode ? "bg-amber-400 text-black" : "text-gray-600"}
            ${chatBotMode ? "" : "cursor-pointer"}
          `}
          onClick={() => setChatBotMode(true)}
        >
          Chat Bot
        </button>

        <button
          className={`w-1/2 h-full rounded-full text-sm font-medium transition-all duration-300
            ${!chatBotMode ? "bg-amber-400 text-black" : "text-gray-600"}
            ${!chatBotMode ? "" : "cursor-pointer"}
          `}
          onClick={() => setChatBotMode(false)}
        >
          Chat Admin
        </button>
      </div>

      <div ref={scrollRef} style={styles.chatArea}>
        {(chatBotMode ? messages : [...chatAdminHistory, ...adminMessages])
          .length === 0 && (
          <div
            style={{ textAlign: "center", marginTop: "40px", color: "#aaa" }}
          >
            <p style={{ fontSize: "12px" }}>Hello! How can I help you today?</p>
          </div>
        )}

        {(chatBotMode ? messages : [...chatAdminHistory, ...adminMessages]).map(
          (msg, index) => {
            const role = getMessageRole(msg);

            return (
              <div key={index} style={styles.messageRow(role)}>
                <div style={styles.bubble(role)}>{msg.text || msg.message}</div>
              </div>
            );
          },
        )}

        {loading && (
          <div style={styles.messageRow("ai")}>
            <span
              style={{ color: "#999", fontSize: "11px", marginLeft: "10px" }}
            >
              Typing...
            </span>
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            style={styles.inputField}
            value={chatBotMode ? inputBot : inputAdmin}
            onChange={(e) =>
              chatBotMode
                ? setInputBot(e.target.value)
                : setInputAdmin(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                chatBotMode ? sendMessage() : sendAdminMessage();
              }
            }}
            placeholder="Type a message..."
          />
          <button
            onClick={chatBotMode ? sendMessage : sendAdminMessage}
            disabled={
              loading || (chatBotMode ? !inputBot.trim() : !inputAdmin.trim())
            }
            style={styles.sendButton}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
