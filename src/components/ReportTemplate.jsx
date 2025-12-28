import React, { useMemo } from "react";
import { Card, Typography, Button, Row, Col, Tag, Empty, Statistic, Divider } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { generateReport } from "../utils/reportGenerator";
import Logo from "../assets/sagrada.png";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

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

const { Title, Text } = Typography;

const COLORS = ["#1890ff", "#52c41a", "#fa8c16", "#f5222d", "#722ed1", "#13c2c2", "#eb2f96"];

export default function ReportTemplate({ title, columns, data, exportType = "pdf", reportType = "general" }) {
  const formattedData = useMemo(() => {
    return data.map((row, index) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((key) => {
        const value = newRow[key];

        if (typeof value === "number") {
          return;
        }

        if (value instanceof Date) {
          newRow[key] = dayjs(value).format("YYYY-MM-DD HH:mm");

        } else if (typeof value === "string" && value.length > 0 && (value.includes("-") || value.includes("/"))) {
          const dateValue = dayjs(value);
          if (dateValue.isValid() && !isNaN(Date.parse(value))) {
            newRow[key] = dateValue.format("YYYY-MM-DD HH:mm");
          }
        }
      });

      return { ...newRow, id: row.id || index };
    });
  }, [data]);

  const handleExport = async () => {
    let titleText = 'Report';
    
    if (typeof title === 'string') {
      titleText = title;

    } else if (typeof title === 'object' && title !== null) {
      if (title.props) {
        const children = title.props.children;

        if (typeof children === 'string') {
          titleText = children;

        } else if (Array.isArray(children)) {
          titleText = children
            .filter(child => typeof child === 'string')
            .join(' ') || 'Report';
            
        } else if (children && typeof children === 'object' && children.props) {
          titleText = typeof children.props.children === 'string' 
            ? children.props.children 
            : 'Report';
        }
      }
    }

    let logoBase64 = null;
    try {
      logoBase64 = await imageToBase64(Logo);
      
    } catch (error) {
      console.warn('Could not convert logo to base64:', error);
    }
    
    await generateReport({
      type: exportType,
      title: titleText,
      columns,
      data: formattedData,
      logoBase64,
    });
  };

  const donationCharts = useMemo(() => {
    if (reportType !== "donation") return null;
    if (formattedData.length === 0) {
      return {
        monthlyChartData: [],
        paymentMethodChartData: [],
        topDonors: [],
        totalAmount: 0,
        avgAmount: 0,
        maxAmount: 0,
      };
    }

    const monthlyData = {};
    formattedData.forEach((donation) => {
      let dateStr = donation.date || donation.createdAt || "";

      if (dateStr) {
        const parsedDate = dayjs(dateStr);

        if (parsedDate.isValid()) {
          const month = parsedDate.format("YYYY-MM");

          if (!monthlyData[month]) {
            monthlyData[month] = { month, amount: 0, count: 0 };
          }

          monthlyData[month].amount += parseFloat(donation.amount) || 0;
          monthlyData[month].count += 1;
        }
      }
    });

    const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    const paymentMethodData = {};
    formattedData.forEach((donation) => {
      const method = donation.paymentMethod || "Unknown";

      if (!paymentMethodData[method]) {
        paymentMethodData[method] = { name: method, value: 0, count: 0 };
      }

      paymentMethodData[method].value += parseFloat(donation.amount) || 0;
      paymentMethodData[method].count += 1;
    });

    const paymentMethodChartData = Object.values(paymentMethodData);

    const donorData = {};
    formattedData.forEach((donation) => {
      const donor = donation.donor_name || "Unknown";
      if (!donorData[donor]) {
        donorData[donor] = { name: donor, amount: 0, count: 0 };
      }

      donorData[donor].amount += parseFloat(donation.amount) || 0;
      donorData[donor].count += 1;
    });

    const topDonors = Object.values(donorData)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const totalAmount = formattedData.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const avgAmount = formattedData.length > 0 ? totalAmount / formattedData.length : 0;
    const maxAmount = Math.max(...formattedData.map((d) => parseFloat(d.amount) || 0));

    return {
      monthlyChartData,
      paymentMethodChartData,
      topDonors,
      totalAmount,
      avgAmount,
      maxAmount,
    };
  }, [formattedData, reportType]);

  const bookingCharts = useMemo(() => {
    if (reportType !== "booking") return null;

    if (formattedData.length === 0) {
      return {
        typeChartData: [],
        statusChartData: [],
        monthlyChartData: [],
      };
    }

    const typeData = {};
    formattedData.forEach((booking) => {
      const type = booking.bookingType || "Unknown";

      if (!typeData[type]) {
        typeData[type] = { name: type, value: 0 };
      }

      typeData[type].value += 1;
    });

    const typeChartData = Object.values(typeData);

    const statusData = {};
    formattedData.forEach((booking) => {
      const status = booking.status || "Unknown";

      if (!statusData[status]) {
        statusData[status] = { name: status, value: 0 };
      }

      statusData[status].value += 1;
    });

    const statusChartData = Object.values(statusData);

    const monthlyData = {};
    formattedData.forEach((booking) => {
      let dateStr = booking.date || booking.createdAt || "";

      if (dateStr) {
        const parsedDate = dayjs(dateStr);

        if (parsedDate.isValid()) {
          const month = parsedDate.format("YYYY-MM");

          if (!monthlyData[month]) {
            monthlyData[month] = { month, count: 0 };
          }

          monthlyData[month].count += 1;
        }
      }
    });

    const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    return {
      typeChartData,
      statusChartData,
      monthlyChartData,
    };
  }, [formattedData, reportType]);

  const systemCharts = useMemo(() => {
    if (reportType !== "system" || formattedData.length === 0) return null;

    const chartData = formattedData.map((item) => ({
      name: item.metric,
      value: typeof item.value === "number" ? item.value : parseFloat(item.value) || 0,
    }));

    return { chartData };
  }, [formattedData, reportType]);

  const renderDonationReport = () => {
    if (!donationCharts) return <Empty description="No donation data available" />;

    return (
      <>
        {/* Summary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Donations"
                value={donationCharts.totalAmount}
                precision={2}
                prefix="₱"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Average Donation"
                value={donationCharts.avgAmount}
                precision={2}
                prefix="₱"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Largest Donation"
                value={donationCharts.maxAmount}
                precision={2}
                prefix="₱"
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Monthly Donations Trend */}
        <Card title="Donations Over Time" style={{ marginBottom: 24 }}>
          {donationCharts.monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={donationCharts.monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.6}
                  name="Amount (₱)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No time series data available" />
          )}
        </Card>

        <Row gutter={[16, 16]}>
          {/* Payment Method Breakdown */}
          <Col xs={24} lg={12}>
            <Card title="Donations by Payment Method">
              {donationCharts.paymentMethodChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donationCharts.paymentMethodChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {donationCharts.paymentMethodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No payment method data" />
              )}
            </Card>
          </Col>

          {/* Top Donors */}
          <Col xs={24} lg={12}>
            <Card title="Top 10 Donors">
              {donationCharts.topDonors.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donationCharts.topDonors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No donor data available" />
              )}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderBookingReport = () => {
    if (!bookingCharts) return <Empty description="No booking data available" />;

    return (
      <>
        {/* Bookings by Type */}
        <Card title="Bookings by Type" style={{ marginBottom: 24 }}>
          {bookingCharts.typeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingCharts.typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1890ff" name="Number of Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No booking type data available" />
          )}
        </Card>

        <Row gutter={[16, 16]}>
          {/* Bookings by Status */}
          <Col xs={24} lg={12}>
            <Card title="Bookings by Status">
              {bookingCharts.statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingCharts.statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookingCharts.statusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name.toLowerCase() === "confirmed"
                              ? "#52c41a"
                              : entry.name.toLowerCase() === "pending"
                                ? "#fa8c16"
                                : entry.name.toLowerCase() === "cancelled"
                                  ? "#f5222d"
                                  : COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No status data available" />
              )}
            </Card>
          </Col>

          {/* Bookings Over Time */}
          <Col xs={24} lg={12}>
            <Card title="Bookings Over Time">
              {bookingCharts.monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookingCharts.monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#722ed1"
                      strokeWidth={2}
                      name="Number of Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No time series data available" />
              )}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderSystemReport = () => {
    if (!systemCharts) return <Empty description="No system data available" />;

    return (
      <Card title="System Metrics">
        {systemCharts.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemCharts.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No system metrics data available" />
        )}
      </Card>
    );
  };

  return (
    <Card style={{ margin: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text style={{ fontFamily: 'Poppins' }} type="secondary">
            {formattedData.length} {formattedData.length === 1 ? "record" : "records"} • Generated on{" "}
            {dayjs().format("MMMM DD, YYYY")}
          </Text>
        </div>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} size="large" className="border-btn">
          Export Report
        </Button>
      </div>

      {formattedData.length === 0 ? (
        <Empty description="No data available" />
      ) : (
        <>
          {reportType === "donation" && renderDonationReport()}
          {reportType === "booking" && renderBookingReport()}
          {reportType === "system" && renderSystemReport()}
          {reportType === "general" && (
            <Card>
              <Text>Select a specific report type to view detailed analytics and charts.</Text>
            </Card>
          )}
        </>
      )}
    </Card>
  );
}
