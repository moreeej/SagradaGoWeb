import { useEffect, useState } from "react";
import { Card, Typography, Table, message, Button, Spin } from "antd";
import axios from "axios";
import { API_URL } from "../../Constants";

const { Title } = Typography;

export default function VolunteersList() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/getAllVolunteers`); // call new endpoint

      const fetchedVolunteers = response?.data?.volunteers || [];

      const formattedVolunteers = fetchedVolunteers.map((v) => ({
        ...v,
        key: v._id,
        createdAtFormatted: v.createdAt
          ? new Date(v.createdAt).toLocaleDateString()
          : "N/A",
      }));

      setVolunteers(formattedVolunteers);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      message.error("Failed to fetch volunteers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "gray";
        if (status === "confirmed") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "cancelled") color = "red";
        return <span style={{ color, fontWeight: 500 }}>{status}</span>;
      },
    },
    { title: "Event", dataIndex: "eventTitle", key: "eventTitle" },
    { title: "Signed Up", dataIndex: "createdAtFormatted", key: "createdAt" },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>All Volunteers</Title>

        <Button
          onClick={() => fetchVolunteers()}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Refresh
        </Button>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={volunteers}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
}
