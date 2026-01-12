import { Outlet, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";

const { Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUserStr = localStorage.getItem("currentUser");
    const sessionTimeout = localStorage.getItem("sessionTimeout");

    if (!currentUserStr || !sessionTimeout) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    const timeoutTime = parseInt(sessionTimeout);
    if (isNaN(timeoutTime) || Date.now() >= timeoutTime) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    let currentUser;
    try {
      currentUser = JSON.parse(currentUserStr);

    } catch (error) {
      console.error("Error parsing currentUser:", error);
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    const isAdmin = currentUser.is_admin === true || 
                    currentUser.position === 'admin' || 
                    currentUser.position === 'sub-admin' ||
                    currentUser.role === 'admin' ||
                    currentUser.role === 'sub-admin';

    if (!isAdmin) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }
  }, [navigate]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <Layout style={{ marginLeft: 256 }}>
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: "100vh",
            background: "#f0f2f5",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

