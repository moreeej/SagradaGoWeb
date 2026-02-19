import React, { useState, useEffect, useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import "../styles/profile.css";
import { Modal, Button, message, Spin, Tabs, List, Tag, Select } from "antd";
import axios from "axios";
import { API_URL } from "../Constants";

export default function ActivityPage() {
    const { currentUser: contextUser } = useContext(NavbarContext);

    const getStoredUser = () => {
        try {
            const stored = localStorage.getItem("currentUser");
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    };

    const normalizeUser = (u) => ({
        ...u,
        uid: u?.uid || u?.user_id || u?.id,
        first_name: u?.first_name || "",
        middle_name: u?.middle_name || "",
        last_name: u?.last_name || "",
        contact_number: u?.contact_number || "",
        is_admin: u?.is_admin || false,
    });

    const storedUser = getStoredUser();
    const currentUser = normalizeUser(contextUser || storedUser);

    const [donations, setDonations] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser || !currentUser.uid) {
                setLoading(false);
                return;
            }

            try {
                // Fetch donations
                const donationsRes = await axios.post(`${API_URL}/getUserDonations`, {
                    uid: currentUser.uid,
                });
                setDonations(donationsRes.data.donations || []);

                // Fetch events/volunteers
                const eventsRes = await axios.post(`${API_URL}/getUserVolunteers`, {
                    user_id: currentUser.uid,
                });
                setEvents(eventsRes.data.volunteers || []);

                // ================= BOOKINGS =================
                const allBookings = [];

                const normalize = (data, sacrament) =>
                    (data || []).map(item => ({
                        sacrament,
                        date: item.date,
                        time: item.time,
                        status: item.status || "pending",
                        createdAt: item.createdAt,
                        amount: item.amount,
                        payment_method: item.payment_method,
                    }));

                const baptismRes = await axios.post(`${API_URL}/getUserBaptisms`, {
                    uid: currentUser.uid,
                });
                allBookings.push(...normalize(baptismRes.data.baptisms, "Baptism"));

                const weddingRes = await axios.post(`${API_URL}/getUserWeddings`, {
                    uid: currentUser.uid,
                });
                allBookings.push(...normalize(weddingRes.data.weddings, "Wedding"));

                const burialRes = await axios.post(`${API_URL}/getUserBurials`, {
                    uid: currentUser.uid,
                });
                allBookings.push(...normalize(burialRes.data.burials, "Burial"));

                const communionRes = await axios.post(`${API_URL}/getUserCommunions`, {
                    uid: currentUser.uid,
                });
                allBookings.push(...normalize(communionRes.data.communions, "Communion"));

                const anointingRes = await axios.post(`${API_URL}/getUserAnointings`, {
                    uid: currentUser.uid,
                });
                allBookings.push(...normalize(anointingRes.data.anointings, "Anointing of the Sick"));

                // ===== Normalize status to match mobile =====
                setBookings(
                    allBookings.map(b => ({
                        ...b,
                        status: b.status === "confirmed" ? "approved" : b.status,
                    }))
                );

            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser]);

    const filteredBookings = statusFilter === "all"
        ? bookings
        : bookings.filter(b => b.status === statusFilter);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Spin size="large" tip="Loading activity history..." />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <h2>Please log in to view your activity history.</h2>
            </div>
        );
    }

    const handleConfirmCancel = async () => {
        if (!selectedBooking) return;

        try {
            const sacramentMap = {
                Baptism: "baptism",
                Wedding: "wedding",
                Burial: "burial",
                Communion: "communion",
                "Anointing of the Sick": "anointing",
            };

            const bookingType = sacramentMap[selectedBooking.sacrament];
            if (!bookingType) throw new Error("Invalid booking type");

            const response = await axios.put(`${API_URL}/cancelBooking`, {
                transaction_id: selectedBooking.transaction_id || selectedBooking.id,
                bookingType,
            });

            // Update bookings locally
            setBookings((prev) =>
                prev.map((b) =>
                    b === selectedBooking ? { ...b, status: "cancelled" } : b
                )
            );

            message.success(response.data.message || "Booking cancelled successfully");
            setSelectedBooking(null);
        } catch (error) {
            console.error("Cancel booking error:", error);
            message.error(error.response?.data?.message || error.message || "Failed to cancel booking");
        }
    };

    const handleCancelConfirm = () => {
        setSelectedBooking(null);
    };

    return (
        <div className="profileContainer">
            <div style={{ padding: 32 }}>
                <div style={{ marginBottom: 40, marginTop: 10 }}>
                    <h2 className="pageTitle">Activity History</h2>
                    <p style={{ marginTop: -20 }}>
                        View your donation and event registration history.
                    </p>
                </div>

                {/* History Section */}
                <div className="history-section">
                    <Tabs defaultActiveKey="1" className="history-tabs">
                        <Tabs.TabPane tab="Donations" key="1">
                            <List
                                className="history-list"
                                dataSource={donations}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={`PHP ${Number(item.amount).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                            })}`}
                                            description={
                                                <>
                                                    <Tag color={item.status === "confirmed" ? "success" : "warning"}>
                                                        {item.status?.toUpperCase()}
                                                    </Tag>
                                                    <span> via {item.paymentMethod}</span>
                                                    <br />
                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                                locale={{ emptyText: <div className="history-empty">No donations found.</div> }}
                            />
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="Events" key="2">
                            <div
                                style={{
                                    maxHeight: "530px",
                                    overflowY: "auto",
                                    paddingRight: "10px",
                                }}
                            >
                                <List
                                    className="history-list"
                                    dataSource={events}
                                    renderItem={(item) => {
                                        const isVolunteer = item.registration_type?.toLowerCase() === "volunteer";
                                        const tagColor = isVolunteer ? "green" : "blue";
                                        const label = item.registration_type || "Participant";

                                        return (
                                            <List.Item>
                                                <List.Item.Meta
                                                    title={
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            width: "100%"
                                                        }}>
                                                            <span style={{ fontWeight: 600 }}>
                                                                {item.eventTitle || item.title}
                                                            </span>
                                                            <Tag color={tagColor} style={{ marginRight: 0 }}>
                                                                {label.toUpperCase()}
                                                            </Tag>
                                                        </div>
                                                    }
                                                    description={
                                                        <div style={{ marginTop: "4px" }}>
                                                            <span style={{ color: "#8c8c8c" }}>{item.location}</span>
                                                            <br />
                                                            <span style={{ fontSize: "12px", color: "#bfbfbf" }}>
                                                                {new Date(item.date || item.createdAt).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                    locale={{ emptyText: <div className="history-empty">No event registrations found.</div> }}
                                />
                            </div>
                        </Tabs.TabPane>

                        {/* Bookings Tab */}
                        <Tabs.TabPane tab="Bookings" key="3">
                            {/* Status Filter Dropdown */}
                            <div style={{ marginBottom: 16 }}>
                                <Select
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    style={{ width: 200 }}
                                >
                                    <Select.Option value="all">All</Select.Option>
                                    <Select.Option value="approved">Approved</Select.Option>
                                    <Select.Option value="pending">Pending</Select.Option>
                                    <Select.Option value="cancelled">Cancelled</Select.Option>
                                </Select>
                            </div>

                            {/* FIX: wrap in scrollable container with overflow control */}
                            <div style={{ maxHeight: "530px", overflowY: "auto", paddingRight: "10px" }}>
                                <List
                                    className="history-list"
                                    dataSource={filteredBookings}
                                    renderItem={(item) => (
                                        <List.Item
                                            /* FIX: prevent list item row from overflowing */
                                            style={{ flexWrap: "nowrap", alignItems: "flex-start", overflow: "hidden" }}
                                            actions={
                                                item.status !== "cancelled"
                                                    ? [
                                                        <Button
                                                            type="link"
                                                            danger
                                                            onClick={() => setSelectedBooking(item)}
                                                        >
                                                            Cancel
                                                        </Button>,
                                                    ]
                                                    : []
                                            }
                                        >
                                            <List.Item.Meta
                                                /* FIX: allow meta to shrink and not overflow */
                                                style={{ minWidth: 0, overflow: "hidden" }}
                                                title={
                                                    <div style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        flexWrap: "wrap",   /* FIX: wrap tag below name on small widths */
                                                    }}>
                                                        <span style={{ fontWeight: 600 }}>{item.sacrament}</span>
                                                        <Tag
                                                            color={
                                                                item.status === "approved"
                                                                    ? "green"
                                                                    : item.status === "pending"
                                                                        ? "orange"
                                                                        : "red"
                                                            }
                                                            style={{ marginRight: 0, flexShrink: 0 }}  /* FIX: tag never shrinks */
                                                        >
                                                            {item.status.toUpperCase()}
                                                        </Tag>
                                                    </div>
                                                }
                                                description={
                                                    <>
                                                        <div style={{ color: "#8c8c8c" }}>
                                                            {new Date(item.date).toLocaleDateString()} • {item.time}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: "#bfbfbf" }}>
                                                            Booked on {new Date(item.createdAt).toLocaleDateString()}
                                                        </div>
                                                        {item.amount && (
                                                            <div style={{ marginTop: 4 }}>
                                                                ₱{Number(item.amount).toLocaleString()} •{" "}
                                                                {item.payment_method === "gcash" ? "GCash" : "In-Person"}
                                                            </div>
                                                        )}
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                    locale={{
                                        emptyText: <div className="history-empty">No bookings found.</div>,
                                    }}
                                />
                            </div>

                            {/* Cancel Confirmation Modal */}
                            <Modal
                                open={!!selectedBooking}
                                title="Cancel Booking"
                                onOk={handleConfirmCancel}
                                onCancel={handleCancelConfirm}
                                okText="Yes, Cancel"
                                cancelText="No"
                            >
                                {selectedBooking && (
                                    <p>
                                        Are you sure you want to cancel your{" "}
                                        <strong>{selectedBooking.sacrament}</strong> booking on{" "}
                                        {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}?
                                    </p>
                                )}
                            </Modal>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}