import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; 
const WARNING_TIME_MS = 1 * 60 * 1000; 

export default function SessionTimeout() {
  const navigate = useNavigate();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("sessionTimeout");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPosition");
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    navigate("/", { replace: true });
    
    window.location.reload();
  }, [navigate]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const sessionTimeout = localStorage.getItem("sessionTimeout");
    
    if (!currentUser || !sessionTimeout) {
      return; 
    }

    const timeoutTime = parseInt(sessionTimeout);
    if (isNaN(timeoutTime) || timeoutTime <= 0) {
      handleSessionExpired();
      return;
    }

    if (Date.now() >= timeoutTime) {
      handleSessionExpired();
      return;
    }

    let checkInterval;
    let timeoutId;

    checkInterval = setInterval(() => {
      const now = Date.now();
      const remaining = timeoutTime - now;

      if (remaining <= 0) {
        // Session expired
        clearInterval(checkInterval);
        handleSessionExpired();

      } else if (remaining <= WARNING_TIME_MS) {
        setIsWarningVisible(true);
        setTimeRemaining(Math.ceil(remaining / 1000));
      }
    }, 1000); 

    timeoutId = setTimeout(() => {
      handleSessionExpired();
    }, timeoutTime - Date.now());

    const resetSession = () => {
      const newTimeout = Date.now() + SESSION_TIMEOUT_MS;
      localStorage.setItem("sessionTimeout", newTimeout.toString());

      if (timeoutId) clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);

      setIsWarningVisible(false);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.addEventListener(event, resetSession, true);
    });

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetSession, true);
      });
    };
  }, [navigate, handleSessionExpired]);

  const handleExtendSession = () => {
    const newTimeout = Date.now() + SESSION_TIMEOUT_MS;
    localStorage.setItem("sessionTimeout", newTimeout.toString());
    setIsWarningVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      title="Session Timeout Warning"
      open={isWarningVisible}
      closable={false}
      maskClosable={false}
      footer={[
        <button
          key="extend"
          onClick={handleExtendSession}
          className="filled-btn"
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          Stay Logged In
        </button>,
      ]}
    >
      <p>
        Your session will expire in <strong>{formatTime(timeRemaining)}</strong>.
        Click "Stay Logged In" to extend your session.
      </p>
    </Modal>
  );
}
