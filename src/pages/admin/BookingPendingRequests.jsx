import { useState, useEffect, Fragment } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  Modal,
  message,
  Spin,
  Empty,
  Tooltip,
  Tabs,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  PhoneOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../Constants";
import { supabase } from "../../config/supabase";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function BookingPendingRequests() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [priests, setPriests] = useState([]);
  const [selectedPriestId, setSelectedPriestId] = useState(null);
  const [loadingPriests, setLoadingPriests] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');

  useEffect(() => {
    fetchAllBookings();
    fetchPriests();
  }, [statusFilter]);

  const fetchPriests = async () => {
    try {
      setLoadingPriests(true);
      const response = await axios.get(`${API_URL}/getAllPriests`);
      if (response.data && response.data.priests) {
        setPriests(response.data.priests);
      }
    } catch (error) {
      console.error("Error fetching priests:", error);
      message.error("Failed to load priests list");
    } finally {
      setLoadingPriests(false);
    }
  };

  useEffect(() => {
    filterBookings();
  }, [searchTerm, bookings, typeFilter, monthFilter]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const [weddings, baptisms, burials, communions, confirmations, anointings, confessions] = await Promise.all([
        axios.get(`${API_URL}/admin/getAllWeddings`).catch(() => ({ data: { weddings: [] } })),
        axios.get(`${API_URL}/admin/getAllBaptisms`).catch(() => ({ data: { baptisms: [] } })),
        axios.get(`${API_URL}/admin/getAllBurials`).catch(() => ({ data: { burials: [] } })),
        axios.get(`${API_URL}/admin/getAllCommunions`).catch(() => ({ data: { communions: [] } })),
        axios.get(`${API_URL}/admin/getAllConfirmations`).catch(() => ({ data: { confirmations: [] } })),
        axios.get(`${API_URL}/admin/getAllAnointings`).catch(() => ({ data: { anointings: [] } })),
        axios.get(`${API_URL}/admin/getAllConfessions`).catch(() => ({ data: { bookings: [] } })),
      ]);

      const normalizedConfessions = (confessions.data.bookings || []).map((b) => ({
        ...b,
        bookingType: "Confession",
        typeLabel: "Confession",
        date: b.date ? new Date(b.date).toISOString() : null,
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
        status: b.status || "pending",
        full_name: b.full_name || b.name || "N/A",
        transaction_id: b.transaction_id || `CONF-${Date.now()}`,
        time: b.time || null,
      }));

      const allBookings = [
        ...(weddings.data.weddings || []).map((b) => ({ ...b, bookingType: "Wedding", typeLabel: "Wedding" })),
        ...(baptisms.data.baptisms || []).map((b) => ({ ...b, bookingType: "Baptism", typeLabel: "Baptism" })),
        ...(burials.data.burials || []).map((b) => ({ ...b, bookingType: "Burial", typeLabel: "Burial" })),
        ...(communions.data.communions || []).map((b) => ({ ...b, bookingType: "Communion", typeLabel: "Communion" })),
        ...(confirmations.data.confirmations || []).map((b) => ({ ...b, bookingType: "Confirmation", typeLabel: "Confirmation" })),
        ...(anointings.data.anointings || []).map((b) => ({ ...b, bookingType: "Anointing", typeLabel: "Anointing of the Sick" })),
        ...normalizedConfessions
      ];

      if (process.env.NODE_ENV === 'development' && allBookings.length > 0) {
        console.log('Sample booking time fields:', allBookings.slice(0, 3).map(b => ({
          type: b.bookingType,
          transaction_id: b.transaction_id,
          time: b.time,
          timeType: typeof b.time
        })));
      }

      let filtered = allBookings;

      if (statusFilter !== "all") {
        filtered = allBookings.filter((b) => b.status === statusFilter);
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setBookings(filtered);

      const total = allBookings.length;
      const pending = allBookings.filter((b) => b.status === "pending").length;
      const confirmed = allBookings.filter((b) => b.status === "confirmed").length;
      const cancelled = allBookings.filter((b) => b.status === "cancelled").length;

      setStats({ total, pending, confirmed, cancelled });

    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to fetch bookings. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (typeFilter !== "all") {
      filtered = filtered.filter((b) => b.bookingType === typeFilter);
    }

    if (monthFilter !== "all") {
      filtered = filtered.filter((b) => {
        if (!b.date) return false;
        const bookingDate = new Date(b.date);

        if (isNaN(bookingDate.getTime())) return false;

        return bookingDate.getMonth() + 1 === parseInt(monthFilter);
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((b) => {
        const searchableFields = [
          b.transaction_id,
          b.contact_number,
          b.groom_first_name,
          b.groom_last_name,
          b.bride_first_name,
          b.bride_last_name,
          b.first_name,
          b.last_name,
          b.deceased_name,
          b.deceased_age,
          b.deceased_civil_status,
          b.requested_by,
          b.relationship_to_deceased,
          b.address,
          b.place_of_mass,
          b.mass_address,
          b.user?.name,
          b.user?.email,
        ].filter(Boolean);
        return searchableFields.some((field) => field?.toLowerCase().includes(term));
      });
    }

    setFilteredBookings(filtered);
  };

  const getMonthOptions = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return [
      { value: "all", label: "All Months" },
      ...months.map((month, index) => ({
        value: String(index + 1),
        label: month,
      })),
    ];
  };

  const handleStatusUpdate = async (bookingId, bookingType, newStatus) => {
    try {
      if (newStatus === "confirmed" && !selectedPriestId) {
        message.warning("Please select a priest before confirming the booking.");
        return;
      }

      setUpdateLoading(true);
      const endpointMap = {
        Wedding: "updateWeddingStatus",
        Baptism: "updateBaptismStatus",
        Burial: "updateBurialStatus",
        Communion: "updateCommunionStatus",
        Confirmation: "updateConfirmationStatus",
        Anointing: "updateAnointingStatus",
        Confession: "updateConfessionStatus",
      };

      const endpoint = endpointMap[bookingType];
      if (!endpoint) {
        message.error("Invalid booking type");
        return;
      }

      const selectedPriest = priests.find(p => p.uid === selectedPriestId);
      
      await axios.put(`${API_URL}/${endpoint}`, {
        transaction_id: bookingId,
        status: newStatus,
        priest_id: newStatus === "confirmed" ? selectedPriestId : null,
        priest_name: newStatus === "confirmed" && selectedPriest ? selectedPriest.full_name : null,
      });

      message.success(`Booking ${newStatus === "confirmed" ? "confirmed" : newStatus === "cancelled" ? "cancelled" : "updated"} successfully.`);
      fetchAllBookings();
      setDetailModalVisible(false);
      setSelectedPriestId(null);

    } catch (error) {
      console.error("Error updating booking status:", error);
      message.error("Failed to update booking status. Please try again.");

    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
      confirmed: { color: "green", icon: <CheckCircleOutlined />, text: "Confirmed" },
      cancelled: { color: "red", icon: <CloseCircleOutlined />, text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getTypeTag = (type) => {
    const colorMap = {
      Wedding: "purple",
      Baptism: "blue",
      Burial: "gray",
      Communion: "cyan",
      Confirmation: "geekblue",
      Anointing: "orange",
      Confession: "magenta",
    };

    return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getName = (booking) => {
    if (booking.bookingType === "Wedding") {
      return `${booking.groom_first_name || ""} ${booking.groom_last_name || ""} & ${booking.bride_first_name || ""} ${booking.bride_last_name || ""}`.trim();
      
    } else if (booking.bookingType === "Burial") {
      return (
        booking.deceased_name ||
        booking.name ||
        booking.user?.name ||
        booking.full_name ||
        `${booking.first_name || ""} ${booking.last_name || ""}`.trim() ||
        "N/A"
      );

    } else {
      return booking.user?.name || booking.name || booking.full_name || `${booking.first_name || ""} ${booking.last_name || ""}`.trim() || "N/A";
    }
  };

  const getEmail = (booking) => {
    return booking.user?.email || booking.email || "N/A";
  };

  const formatTimeOnly = (timeValue) => {
    if (timeValue === null || timeValue === undefined || timeValue === '') {
      return "N/A";
    }

    const timeStr = String(timeValue).trim();
    
    if (!timeStr || timeStr === 'null' || timeStr === 'undefined' || timeStr === 'NaN') {
      return "N/A";
    }
    
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\.[\d]+)?$/);
    if (timeMatch) {
      const hours24 = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);

      if (!isNaN(hours24) && !isNaN(minutes) && hours24 >= 0 && hours24 <= 23 && minutes >= 0 && minutes <= 59) {
        const hours = hours24 % 12 || 12;
        const ampm = hours24 >= 12 ? "PM" : "AM";

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      }
    }
    
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime()) && date instanceof Date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      }

    } catch (e) {
      // If date parsing fails, continue to return original or N/A
    }

    console.warn('Unable to format time value:', timeValue, 'type:', typeof timeValue);
    return "N/A";
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "bookingType",
      key: "bookingType",
      render: (type) => getTypeTag(type),
      width: 120,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => <Text strong>{getName(record)}</Text>,
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      render: (id) => <Text code>{id || "N/A"}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (_, record) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Time value for record:', record.transaction_id, 'time:', record.time, 'type:', typeof record.time);
        }
        return <span>{formatTimeOnly(record.time)}</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      width: 120,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setDetailModalVisible(true);
              }}
            >
              View
            </Button>
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                style={{ color: "#52c41a" }}
                onClick={() => handleStatusUpdate(record.transaction_id, record.bookingType, "confirmed")}
                loading={updateLoading}
              >
                Confirm
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleStatusUpdate(record.transaction_id, record.bookingType, "cancelled")}
                loading={updateLoading}
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
      ),
      width: 200,
    },
  ];

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    const details = [];
    Object.keys(selectedBooking).forEach((key) => {
      if (["_id", "__v", "bookingType", "typeLabel", "priest_id", "user", "uid", "createdAt", "updatedAt"].includes(key)) return;
      const value = selectedBooking[key];

      if (value !== null && value !== undefined && value !== "") {
        details.push({ key, value });
      }
    });

    return (
      <div>
        <Row gutter={[16, 16]}>
          {/* Booking Type */}
          <Col span={24}>
            <Text strong>Booking Type:</Text>
            <div>{getTypeTag(selectedBooking.bookingType)}</div>
          </Col>

          {/* Status */}
          <Col span={24}>
            <Text strong>Status:</Text>
            <div>{getStatusTag(selectedBooking.status)}</div>
          </Col>

          {/* Priest Assignment - Show when confirming pending booking */}
          {selectedBooking?.status === "pending" && (
            <Col span={24}>
              <Text strong>Assign Priest:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Select a priest"
                value={selectedPriestId}
                onChange={(value) => setSelectedPriestId(value)}
                loading={loadingPriests}
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
                }
              >
                {priests.map((priest) => (
                  <Option key={priest.uid} value={priest.uid}>
                    {priest.full_name}
                  </Option>
                ))}
              </Select>
              {selectedBooking.priest_name && (
                <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                  Currently assigned: {selectedBooking.priest_name}
                </Text>
              )}
            </Col>
          )}

          {/* Show assigned priest if confirmed */}
          {selectedBooking?.status === "confirmed" && selectedBooking.priest_name && (
            <Col span={24}>
              <Text strong>Assigned Priest:</Text>
              <div>{selectedBooking.priest_name}</div>
            </Col>
          )}

          {/* Payment Method */}
          {selectedBooking?.payment_method && (
            <Col span={12}>
              <Text strong>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Payment Method:
              </Text>
              <div>
                <Tag color={selectedBooking.payment_method === 'gcash' ? 'green' : 'blue'}>
                  {selectedBooking.payment_method === 'gcash' ? 'GCash' : 'In-Person Payment'}
                </Tag>
              </div>
            </Col>
          )}

          {/* Amount */}
          {selectedBooking?.amount !== undefined && selectedBooking?.amount !== null && (
            <Col span={12}>
              <Text strong>
                <DollarOutlined style={{ marginRight: 8 }} />
                Amount:
              </Text>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                ₱{parseFloat(selectedBooking.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </Col>
          )}

          {/* Name */}
          <Col span={12}>
            <Text strong>Name:</Text>
            <div>{getName(selectedBooking)}</div>
          </Col>

          {/* Email */}
          <Col span={12}>
            <Text strong>Email:</Text>
            <div>{getEmail(selectedBooking)}</div>
          </Col>

          {/* Wedding Images Section */}
          {selectedBooking?.bookingType === "Wedding" && (
            <>
              {selectedBooking?.groom_pic && (
                <Col span={12}>
                  <Text strong>Groom Photo:</Text>
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      let imageUrl = selectedBooking.groom_pic;
                      if (!imageUrl.startsWith('http')) {
                        const { data } = supabase.storage.from('bookings').getPublicUrl(selectedBooking.groom_pic);
                        imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${selectedBooking.groom_pic}`;
                      }
                      return (
                        <img
                          src={imageUrl}
                          alt="Groom Photo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: 8,
                            border: '1px solid #d9d9d9',
                            cursor: 'pointer',
                            objectFit: 'cover',
                          }}
                          onClick={() => {
                            setSelectedImageUrl(imageUrl);
                            setSelectedImageTitle('Groom Photo');
                            setImageModalVisible(true);
                          }}
                          onError={(e) => {
                            console.error('Error loading groom photo:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                    })()}
                  </div>
                </Col>
              )}
              {selectedBooking?.bride_pic && (
                <Col span={12}>
                  <Text strong>Bride Photo:</Text>
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      let imageUrl = selectedBooking.bride_pic;
                      if (!imageUrl.startsWith('http')) {
                        const { data } = supabase.storage.from('bookings').getPublicUrl(selectedBooking.bride_pic);
                        imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${selectedBooking.bride_pic}`;
                      }
                      return (
                        <img
                          src={imageUrl}
                          alt="Bride Photo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: 8,
                            border: '1px solid #d9d9d9',
                            cursor: 'pointer',
                            objectFit: 'cover',
                          }}
                          onClick={() => {
                            setSelectedImageUrl(imageUrl);
                            setSelectedImageTitle('Bride Photo');
                            setImageModalVisible(true);
                          }}
                          onError={(e) => {
                            console.error('Error loading bride photo:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                    })()}
                  </div>
                </Col>
              )}
            </>
          )}

          {/* Burial-specific deceased information section */}
          {selectedBooking?.bookingType === "Burial" && (
            <>
              {selectedBooking?.deceased_name && (
                <Col span={12}>
                  <Text strong>Deceased Name:</Text>
                  <div>{selectedBooking.deceased_name}</div>
                </Col>
              )}
              {selectedBooking?.deceased_age && (
                <Col span={12}>
                  <Text strong>Deceased Age:</Text>
                  <div>{selectedBooking.deceased_age}</div>
                </Col>
              )}
              {selectedBooking?.deceased_civil_status && (
                <Col span={12}>
                  <Text strong>Civil Status:</Text>
                  <div>{selectedBooking.deceased_civil_status}</div>
                </Col>
              )}
              {selectedBooking?.requested_by && (
                <Col span={12}>
                  <Text strong>Requested By:</Text>
                  <div>{selectedBooking.requested_by}</div>
                </Col>
              )}
              {selectedBooking?.relationship_to_deceased && (
                <Col span={12}>
                  <Text strong>Relationship to Deceased:</Text>
                  <div>{selectedBooking.relationship_to_deceased}</div>
                </Col>
              )}
              {selectedBooking?.address && (
                <Col span={24}>
                  <Text strong>Address:</Text>
                  <div>{selectedBooking.address}</div>
                </Col>
              )}
              {selectedBooking?.place_of_mass && (
                <Col span={12}>
                  <Text strong>Place of Mass:</Text>
                  <div>{selectedBooking.place_of_mass}</div>
                </Col>
              )}
              {selectedBooking?.mass_address && (
                <Col span={12}>
                  <Text strong>Mass Address:</Text>
                  <div>{selectedBooking.mass_address}</div>
                </Col>
              )}
            </>
          )}

          {/* Dynamic details */}
          {(() => {
            let addressShown = false;
            let godparentsShown = false;
            
            return details.map(({ key, value }) => {
              if (['payment_method', 'amount', 'proof_of_payment', 'full_name', 'email', 'groom_pic', 'bride_pic', 
                    'deceased_name', 'deceased_age', 'deceased_civil_status', 'requested_by', 
                    'relationship_to_deceased', 'address', 'place_of_mass', 'mass_address'].includes(key)) return null;
              
              if (selectedBooking?.bookingType === "Baptism" && [
                'main_godfather_first_name', 
                'main_godfather_middle_name', 
                'main_godfather_last_name',
                'main_godmother_first_name', 
                'main_godmother_middle_name', 
                'main_godmother_last_name',
                'main_godfather',
                'main_godmother'
              ].includes(key)) return null;
              
              const isAddressField = key === 'address';
              const showGodparentsAfterAddress = isAddressField && selectedBooking?.bookingType === "Baptism" && !godparentsShown;
              
              if (isAddressField) addressShown = true;
              if (showGodparentsAfterAddress) godparentsShown = true;

            const isImageField = typeof value === "string" && (
              value.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
              key.toLowerCase().includes('pic') ||
              key.toLowerCase().includes('photo') ||
              key.toLowerCase().includes('image')
            );
            
            return (
              <Fragment key={key}>
                <Col span={12}>
                  <Text strong>
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                  </Text>
                  
                  <div style={{ marginTop: 4 }}>
                    {key === "date" || key === "candidate_birthday" ? (
                      formatDateOnly(value)
                    ) : key === "time" ? (
                      formatTimeOnly(value)
                    ) : typeof value === "string" && value.toLowerCase().endsWith(".pdf") ? (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          window.open(
                            `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${value}`,
                            "_blank"
                          )
                        }
                      >
                        View PDF
                      </Button>
                    ) : isImageField ? (
                      <div>
                        {(() => {
                          let imageUrl = value;
                          if (!imageUrl.startsWith('http')) {
                            const { data } = supabase.storage.from('bookings').getPublicUrl(value);
                            imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${value}`;
                          }
                          return (
                            <img
                              src={imageUrl}
                              alt={key.replace(/_/g, " ")}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: 8,
                                border: '1px solid #d9d9d9',
                                cursor: 'pointer',
                                objectFit: 'cover',
                              }}
                              onClick={() => {
                                setSelectedImageUrl(imageUrl);
                                setSelectedImageTitle(key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));
                                setImageModalVisible(true);
                              }}
                              onError={(e) => {
                                console.error(`Error loading ${key} image:`, e);
                                e.target.style.display = 'none';
                              }}
                            />
                          );
                        })()}
                      </div>
                    ) : typeof value === "boolean" ? (
                      value ? "Yes" : "No"
                    ) : Array.isArray(value) ? (
                      <ul style={{ paddingLeft: 20 }}>
                        {value.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    ) : typeof value === "object" ? (
                      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(value, null, 2)}</pre>
                    ) : (
                      String(value)
                    )}
                  </div>
                </Col>
                
                {/* Show godparents after address field for Baptism */}
                {showGodparentsAfterAddress && (
                  <>
                    {/* Main Godfather - Only First Name */}
                    {selectedBooking.main_godfather_first_name && (
                      <Col span={12}>
                        <Text strong>Main Godfather Name:</Text>
                        <div>{selectedBooking.main_godfather_first_name}</div>
                        {selectedBooking.main_godfather?.relationship && (
                          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                            Relationship: {selectedBooking.main_godfather.relationship}
                          </Text>
                        )}
                      </Col>
                    )}

                    {/* Main Godmother - Only First Name */}
                    {selectedBooking.main_godmother_first_name && (
                      <Col span={12}>
                        <Text strong>Main Godmother Name:</Text>
                        <div>{selectedBooking.main_godmother_first_name}</div>
                        {selectedBooking.main_godmother?.relationship && (
                          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                            Relationship: {selectedBooking.main_godmother.relationship}
                          </Text>
                        )}
                      </Col>
                    )}
                  </>
                )}
              </Fragment>
            );
            });
          })()}

          {/* Proof of Payment Section */}
          {selectedBooking?.payment_method === 'gcash' && selectedBooking?.proof_of_payment && (
            <Col span={24}>
              <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <Text strong>
                  <FileImageOutlined style={{ marginRight: 8 }} />
                  Proof of Payment:
                </Text>
                <div style={{ marginTop: 12 }}>
                  {(() => {
                    let imageUrl = selectedBooking.proof_of_payment;
                    if (!imageUrl.startsWith('http')) {
                      const { data } = supabase.storage.from('bookings').getPublicUrl(selectedBooking.proof_of_payment);
                      imageUrl = data?.publicUrl || `https://qpwoatrmswpkgyxmzkjv.supabase.co/storage/v1/object/public/bookings/${selectedBooking.proof_of_payment}`;
                    }
                    return (
                      <img
                        src={imageUrl}
                        alt="Proof of Payment"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: 8,
                          border: '1px solid #d9d9d9',
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          console.error('Error loading proof of payment image:', e);
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.innerHTML = '<Text type="secondary">Failed to load proof of payment image</Text>';
                          e.target.parentElement.appendChild(errorDiv);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#262626" }}>
                Booking Pending Requests
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Manage and track all booking requests
              </Text>
            </div>
            <Button icon={<ReloadOutlined />} onClick={fetchAllBookings} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Bookings"
                value={stats.total}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Confirmed"
                value={stats.confirmed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cancelled"
                value={stats.cancelled}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search by name, transaction ID, or contact..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Filter by type"
              >
                <Option value="all">All Types</Option>
                <Option value="Anointing">Anointing</Option>
                <Option value="Baptism">Baptism</Option>
                <Option value="Burial">Burial</Option>
                <Option value="Communion">Communion</Option>
                <Option value="Confession">Confession</Option>
                <Option value="Confirmation">Confirmation</Option>
                <Option value="Wedding">Wedding</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                value={monthFilter}
                onChange={setMonthFilter}
                placeholder="Filter by month"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {getMonthOptions().map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Bookings Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredBookings}
            rowKey={(record) => `${record.bookingType}-${record.transaction_id || record._id}`}
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} bookings`,
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <Empty description="No bookings found" />,
            }}
          />
        </Card>

        {/* Booking Detail Modal */}
        <Modal
          title="Booking Details"
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedBooking(null);
            setSelectedPriestId(null);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>,
            selectedBooking?.status === "pending" && (
              <Button
                key="confirm"
                type="primary"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleStatusUpdate(selectedBooking.transaction_id, selectedBooking.bookingType, "confirmed")}
                loading={updateLoading}
              >
                Confirm Booking
              </Button>
            ),
            selectedBooking?.status === "pending" && (
              <Button
                key="cancel"
                danger
                onClick={() => handleStatusUpdate(selectedBooking.transaction_id, selectedBooking.bookingType, "cancelled")}
                loading={updateLoading}
              >
                Cancel Booking
              </Button>
            ),
          ].filter(Boolean)}
          width={800}
        >
          {renderBookingDetails()}
        </Modal>

        {/* Image View Modal */}
        <Modal
          title={selectedImageTitle}
          open={imageModalVisible}
          onCancel={() => {
            setImageModalVisible(false);
            setSelectedImageUrl(null);
            setSelectedImageTitle('');
          }}
          footer={[
            <Button key="close" onClick={() => {
              setImageModalVisible(false);
              setSelectedImageUrl(null);
              setSelectedImageTitle('');
            }}>
              Close
            </Button>,
            <Button 
              key="open" 
              type="primary"
              onClick={() => {
                if (selectedImageUrl) {
                  window.open(selectedImageUrl, '_blank');
                }
              }}
            >
              Open in New Tab
            </Button>,
          ]}
          width={800}
          centered
        >
          {selectedImageUrl && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <img
                src={selectedImageUrl}
                alt={selectedImageTitle}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  console.error('Error loading image in modal:', e);
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = '<Text type="secondary">Failed to load image</Text>';
                  e.target.parentElement.appendChild(errorDiv);
                }}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
