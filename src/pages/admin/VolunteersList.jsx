import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Typography, Table, message, Button, Spin, Popconfirm, Input, Select, Row, Col, Space } from "antd";
import { SearchOutlined, FilterOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { API_URL } from "../../Constants";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function VolunteersList() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);

  const uniqueRoles = useMemo(() => {
    const roles = new Set();
    volunteers.forEach((v) => {
      if (v.role) roles.add(v.role);
    });
    return Array.from(roles).sort();
  }, [volunteers]);

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

  const applyAllFilters = useCallback((volunteersList, search, status, role, month) => {
    let filtered = volunteersList;

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((volunteer) => {
        const name = (volunteer.name || "").toLowerCase();
        const contact = (volunteer.contact || "").toLowerCase();
        const volunteerRole = (volunteer.role || "").toLowerCase();
        const volunteerStatus = (volunteer.status || "").toLowerCase();
        const eventTitle = (volunteer.eventTitle || "").toLowerCase();

        return (
          name.includes(searchLower) ||
          contact.includes(searchLower) ||
          volunteerRole.includes(searchLower) ||
          volunteerStatus.includes(searchLower) ||
          eventTitle.includes(searchLower)
        );
      });
    }

    if (status) {
      filtered = filtered.filter((volunteer) => volunteer.status === status);
    }

    if (role) {
      filtered = filtered.filter((volunteer) => volunteer.role === role);
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

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/getAllVolunteers`);
      const fetchedVolunteers = response?.data?.volunteers || [];

      const formattedVolunteers = fetchedVolunteers.map((v) => ({
        ...v,
        key: v._id,
        createdAtFormatted: v.createdAt
          ? new Date(v.createdAt).toLocaleDateString()
          : "N/A",
      }));

      setVolunteers(formattedVolunteers);
      setFilteredVolunteers(applyAllFilters(formattedVolunteers, searchText, statusFilter, roleFilter, monthFilter));

    } catch (err) {
      console.error("Error fetching volunteers:", err);
      message.error("Failed to fetch volunteers. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
  };

  const handleMonthFilterChange = (value) => {
    setMonthFilter(value);
  };

  const clearAllFilters = () => {
    setSearchText("");
    setStatusFilter(null);
    setRoleFilter(null);
    setMonthFilter(null);
  };


  useEffect(() => {
    setFilteredVolunteers(applyAllFilters(volunteers, searchText, statusFilter, roleFilter, monthFilter));
  }, [searchText, statusFilter, roleFilter, monthFilter, volunteers, applyAllFilters]);

  const handleStatusUpdate = async (volunteer_id, newStatus) => {
    setUpdating(true);
    try {
      await axios.post(`${API_URL}/updateVolunteerStatus`, { volunteer_id, status: newStatus });
      message.success(`Volunteer ${newStatus} successfully.`);
      fetchVolunteers();

    } catch (err) {
      console.error("Error updating volunteer:", err);
      message.error("Failed to update volunteer status.");

    } finally {
      setUpdating(false);
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
    { title: "Event", dataIndex: "eventTitle", key: "eventTitle" },
    { title: "Signed Up", dataIndex: "createdAtFormatted", key: "createdAt" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1550px", margin: "0 auto", marginTop: 20 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2} style={{ fontFamily: 'Poppins' }}>All Volunteers</Title>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Card>
              <div style={{ marginBottom: 16 }}>
                {/* Filters */}
                <Card style={{ marginBottom: 24 }}>
                  <Row gutter={[16, 16]}>
                    {/* Search */}
                    <Col xs={24} sm={12} md={12}>
                      <Input
                        placeholder="Search volunteers..."
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
                    <Col xs={24} sm={12} md={3}>
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

                    {/* Role Filter */}
                    <Col xs={24} sm={12} md={3}>
                      <Select
                        placeholder="Filter by role"
                        allowClear
                        value={roleFilter}
                        onChange={handleRoleFilterChange}
                        style={{
                          width: '100%',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          padding: '8px 12px',
                          height: '42px',
                        }}
                      >
                        <Option value="all">All Roles</Option>
                        {uniqueRoles.map((role) => (
                          <Option key={role} value={role}>
                            {role}
                          </Option>
                        ))}
                      </Select>
                    </Col>

                    {/* Month Filter */}
                    <Col xs={24} sm={12} md={3}>
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
                    <Col xs={24} sm={12} md={3}>
                      <Button
                        className="border-btn"
                        onClick={clearAllFilters}
                        disabled={!searchText && !statusFilter && !roleFilter && !monthFilter}
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
