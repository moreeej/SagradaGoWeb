import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Typography, Table, message, Button, Spin, Popconfirm, Input, Select, Row, Col, Space, Tag, Tabs } from "antd";
import { SearchOutlined, FilterOutlined, CloseOutlined, CheckOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { API_URL } from "../../Constants";
import { generatePDFReport, generateExcelReport } from "../../utils/reportGenerator";
import Logo from "../../assets/sagrada.png";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const imageToBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);

      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = reject;
    const imageSrc = typeof imagePath === 'string' ? imagePath : (imagePath?.default || imagePath);
    img.src = imageSrc;
  });
};

export default function VolunteersList() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);
  const [activeTab, setActiveTab] = useState("all");


  const monthOptions = useMemo(() => {
    const months = [];
    const currentDate = dayjs();
    for (let i = 0; i < 12; i++) {
      const date = currentDate.subtract(i, 'month');
      const monthKey = date.format('YYYY-MM');
      const monthLabel = date.format('MMMM YYYY');
      months.push({ value: monthKey, label: monthLabel });
    }
    return months;
  }, []);

  const applyAllFilters = useCallback((volunteersList, search, status, month, tab) => {
    let filtered = volunteersList;

    if (tab === "registrations") {
      filtered = filtered.filter((volunteer) => {
        return volunteer.registration_type === "participant";
      });

    } else if (tab === "volunteers") {
      filtered = filtered.filter((volunteer) => {
        return !volunteer.registration_type || volunteer.registration_type === "volunteer";
      });
    }

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((volunteer) => {
        const name = (volunteer.name || "").toLowerCase();
        const contact = (volunteer.contact || "").toLowerCase();
        const volunteerStatus = (volunteer.status || "").toLowerCase();
        const eventTitle = (volunteer.eventTitle || "").toLowerCase();
        const eventType = (volunteer.eventType || "").toLowerCase();

        return (
          name.includes(searchLower) ||
          contact.includes(searchLower) ||
          volunteerStatus.includes(searchLower) ||
          eventTitle.includes(searchLower) ||
          eventType.includes(searchLower)
        );
      });
    }

    if (status) {
      filtered = filtered.filter((volunteer) => volunteer.status === status);
    }

    if (month) {
      filtered = filtered.filter((volunteer) => {
        if (!volunteer.createdAt) return false;
        const volunteerMonth = dayjs(volunteer.createdAt).format('YYYY-MM');
        return volunteerMonth === month;
      });
    }

    return filtered;
  }, []);

  const fetchVolunteers = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await axios.post(`${API_URL}/getAllVolunteers`, {});
      const fetchedVolunteers = response?.data?.volunteers || [];

      const volunteersWithEvents = await Promise.all(
        fetchedVolunteers.map(async (volunteer) => {
          if (volunteer.event_id) {
            try {
              const eventResponse = await axios.get(`${API_URL}/getEvent/${volunteer.event_id}`);
              return {
                ...volunteer,
                event: eventResponse.data.event,
                eventType: eventResponse.data.event?.type || null,
              };

            } catch (error) {
              console.error(`Error fetching event ${volunteer.event_id}:`, error);
              return volunteer;
            }
          }
          return volunteer;
        })
      );

      const formattedVolunteers = volunteersWithEvents.map((v) => ({
        ...v,
        key: v._id,
        createdAtFormatted: v.createdAt
          ? new Date(v.createdAt).toLocaleDateString()
          : "N/A",
      }));

      setVolunteers(formattedVolunteers);
      setFilteredVolunteers(applyAllFilters(formattedVolunteers, searchText, statusFilter, monthFilter, activeTab));

    } catch (err) {
      console.error("Error fetching volunteers:", err);
      if (showLoading) {
        message.error("Failed to fetch volunteers. Please try again.");
      }

    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };


  const handleMonthFilterChange = (value) => {
    setMonthFilter(value);
  };

  const clearAllFilters = () => {
    setSearchText("");
    setStatusFilter(null);
    setMonthFilter(null);
  };


  useEffect(() => {
    setFilteredVolunteers(applyAllFilters(volunteers, searchText, statusFilter, monthFilter, activeTab));
  }, [searchText, statusFilter, monthFilter, activeTab, volunteers, applyAllFilters]);

  const handleStatusUpdate = async (volunteer_id, newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`${API_URL}/updateVolunteerStatus`, { volunteer_id, status: newStatus });
      message.success(`Status updated to ${newStatus} successfully.`);
      fetchVolunteers(false);

    } catch (err) {
      console.error("Error updating volunteer:", err);
      message.error("Failed to update status.");

    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchVolunteers(true);

    const intervalId = setInterval(() => {
      fetchVolunteers(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const getColumns = () => {
    const baseColumns = [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Contact", dataIndex: "contact", key: "contact" },
      {
        title: "Type",
        key: "type",
        render: (_, record) => {
          const registrationType = record.registration_type;
          
          const isParticipant = registrationType === "participant";
          
          return (
            <Tag color={isParticipant ? "blue" : "green"}>
              {isParticipant ? "Participant" : "Volunteer"}
            </Tag>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const normalized = status.toLowerCase();
          let color = "gray";
          let bgColor = "#f0f0f0";

          if (normalized === "confirmed") {
            color = "green";
            bgColor = "#f6ffed";

          } else if (normalized === "pending") {
            color = "orange";
            bgColor = "#fff7e6";

          } else if (normalized === "cancelled") {
            color = "red";
            bgColor = "#fff1f0";
          }

          const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

          return (
            <span
              style={{
                color,
                backgroundColor: bgColor,
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: "12px",
                display: "inline-block",
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              {displayStatus}
            </span>
          );
        },
      },
      { title: "Event/Activity", dataIndex: "eventTitle", key: "eventTitle" },
      {
        title: "Time",
        key: "time",
        render: (_, record) => {
          const event = record.event || {};
          if (event.time_start && event.time_end) {
            return `${event.time_start} - ${event.time_end}`;

          } else if (event.time_start) {
            return `${event.time_start} -`;

          } else if (event.time_end) {
            return `- ${event.time_end}`;
          }

          return "N/A";
        },
      },
      { title: "Signed Up", dataIndex: "createdAtFormatted", key: "createdAt" },
    ];

    if (activeTab !== "registrations") {
      baseColumns.push({
        title: "Actions",
        key: "actions",
        render: (_, record) => {
          const registrationType = record.registration_type;
          const isParticipant = registrationType === "participant";
          
          if (isParticipant) {
            return <span style={{ color: "#999" }}>N/A</span>;
          }

          return (
            <div style={{ display: "flex", gap: "8px" }}>
              {record.status !== "confirmed" && (
                <Popconfirm
                  title="Confirm this volunteer?"
                  onConfirm={() => handleStatusUpdate(record._id, "confirmed")}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<CheckOutlined />}
                    className="border-btn"
                    style={{ padding: '8px' }}
                    size="small"
                    loading={updating}
                  />
                </Popconfirm>
              )}
              {record.status !== "cancelled" && (
                <Popconfirm
                  title="Cancel this volunteer?"
                  onConfirm={() => handleStatusUpdate(record._id, "cancelled")}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    icon={<CloseOutlined />}
                    className="dangerborder-btn"
                    style={{ padding: '8px' }}
                    size="small"
                    loading={updating}
                  />
                </Popconfirm>
              )}
            </div>
          );
        },
      });
    }

    return baseColumns;
  };

  const columns = getColumns();

  const handleExportPDF = async () => {
    try {
      const exportColumns = [
        "Name",
        "Contact",
        "Type",
        "Status",
        "Event/Activity",
        "Time",
        "Signed Up"
      ];

      const exportData = filteredVolunteers.map((record) => {
        const registrationType = record.registration_type;
        const isParticipant = registrationType === "participant";
        const typeText = isParticipant ? "Participant" : "Volunteer";

        const status = record.status || "N/A";
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        const event = record.event || {};
        let timeText = "N/A";
        if (event.time_start && event.time_end) {
          timeText = `${event.time_start} - ${event.time_end}`;

        } else if (event.time_start) {
          timeText = `${event.time_start} -`;

        } else if (event.time_end) {
          timeText = `- ${event.time_end}`;
        }

        return {
          Name: record.name || "N/A",
          Contact: record.contact || "N/A",
          Type: typeText,
          Status: displayStatus,
          "Event/Activity": record.eventTitle || "N/A",
          Time: timeText,
          "Signed Up": record.createdAtFormatted || "N/A"
        };
      });

      let logoBase64 = null;
      try {
        logoBase64 = await imageToBase64(Logo);
        
      } catch (error) {
        console.warn('Could not convert logo to base64:', error);
      }

      await generatePDFReport({
        title: `Participants & Volunteers Report - ${activeTab === "all" ? "All" : activeTab === "registrations" ? "Participants" : "Volunteers"}`,
        columns: exportColumns,
        data: exportData,
        logoBase64
      });

      message.success("PDF report generated successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF report.");
    }
  };

  const handleExportExcel = () => {
    try {
      const exportColumns = [
        { title: "Name", dataIndex: "name" },
        { title: "Contact", dataIndex: "contact" },
        { title: "Type", dataIndex: "type" },
        { title: "Status", dataIndex: "status" },
        { title: "Event/Activity", dataIndex: "eventTitle" },
        { title: "Time", dataIndex: "time" },
        { title: "Signed Up", dataIndex: "createdAtFormatted" }
      ];

      const exportData = filteredVolunteers.map((record) => {
        const registrationType = record.registration_type;
        const isParticipant = registrationType === "participant";
        const typeText = isParticipant ? "Participant" : "Volunteer";

        const status = record.status || "N/A";
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        const event = record.event || {};
        let timeText = "N/A";
        if (event.time_start && event.time_end) {
          timeText = `${event.time_start} - ${event.time_end}`;

        } else if (event.time_start) {
          timeText = `${event.time_start} -`;

        } else if (event.time_end) {
          timeText = `- ${event.time_end}`;
        }

        return {
          name: record.name || "N/A",
          contact: record.contact || "N/A",
          type: typeText,
          status: displayStatus,
          eventTitle: record.eventTitle || "N/A",
          time: timeText,
          createdAtFormatted: record.createdAtFormatted || "N/A"
        };
      });

      generateExcelReport({
        fileName: `Participants_Volunteers_${activeTab === "all" ? "All" : activeTab === "registrations" ? "Participants" : "Volunteers"}_${dayjs().format("YYYY-MM-DD")}`,
        columns: exportColumns,
        data: exportData
      });

      message.success("Excel report generated successfully!");
      
    } catch (error) {
      console.error("Error generating Excel:", error);
      message.error("Failed to generate Excel report.");
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1550px", margin: "0 auto", marginTop: 20 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2} style={{ fontFamily: 'Poppins' }}>Participants & Volunteers</Title>
            <Space>
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                disabled={filteredVolunteers.length === 0}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500
                }}
              >
                Export PDF
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                disabled={filteredVolunteers.length === 0}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500
                }}
              >
                Export Excel
              </Button>
            </Space>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Card>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: "all",
                    label: `All (${volunteers.length})`,
                  },
                  {
                    key: "registrations",
                    label: `Participants (${volunteers.filter(v => {
                      return v.registration_type === "participant";
                    }).length})`,
                  },
                  {
                    key: "volunteers",
                    label: `Volunteers (${volunteers.filter(v => {
                      // Show if registration_type is "volunteer" OR if it doesn't exist (old records)
                      return !v.registration_type || v.registration_type === "volunteer";
                    }).length})`,
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
              
              <div style={{ marginBottom: 16 }}>
                {/* Filters */}
                <Card style={{ marginBottom: 24 }}>
                  <Row gutter={[16, 16]}>
                    {/* Search */}
                    <Col xs={24} sm={12} md={12}>
                      <Input
                        placeholder={`Search ${activeTab === "registrations" ? "participants" : activeTab === "volunteers" ? "volunteers" : "participants & volunteers"}...`}
                        prefix={<SearchOutlined style={{ marginRight: 8 }} />}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          padding: '10px 12px',
                          height: '42px',
                        }}
                      />
                    </Col>

                    {/* Status Filter */}
                    <Col xs={24} sm={12} md={4}>
                      <Select
                        placeholder="Filter by status"
                        allowClear
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        style={{
                          width: '100%',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          padding: '8px 12px',
                          height: '42px',
                        }}
                      >
                        <Option value="all">All Status</Option>
                        <Option value="confirmed">Confirmed</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="cancelled">Cancelled</Option>
                      </Select>
                    </Col>

                    {/* Month Filter */}
                    <Col xs={24} sm={12} md={4}>
                      <Select
                        placeholder="Filter by month"
                        allowClear
                        value={monthFilter}
                        onChange={handleMonthFilterChange}
                        style={{
                          width: '100%',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          padding: '8px 12px',
                          height: '42px',
                        }}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {monthOptions.map((month) => (
                          <Option key={month.value} value={month.value}>
                            {month.label}
                          </Option>
                        ))}
                      </Select>
                    </Col>

                    {/* Clear Filters Button */}
                    <Col xs={24} sm={12} md={4}>
                      <Button
                        className="border-btn"
                        onClick={clearAllFilters}
                        disabled={!searchText && !statusFilter && !monthFilter}
                      >
                        Clear Filters
                      </Button>
                    </Col>
                  </Row>
                </Card>

              </div>
              <Table
                columns={columns}
                dataSource={filteredVolunteers}
                pagination={{ pageSize: 10 }}
                rowKey="_id"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
