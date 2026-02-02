import { useContext, useEffect, useState } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import axios from "axios";
import { API_URL } from "../Constants";
import LoadingAnimation from "../components/LoadingAnimation";
import "../styles/events.css";
import Cookies from "js-cookie";

import Footer from "../components/Footer";
import SignInAlert from "../components/SignInAlert";

import banner1 from "../assets/SAGRADA-FAMILIA-PARISH.jpg";
import banner2 from "../assets/christmas.jpg";
import banner3 from "../assets/dyd.jpg";
import noImage from "../assets/blank-image.jpg";
import { Modal } from "antd";

import {
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export default function Events() {
  const { showSignin } = useContext(NavbarContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showSignInAlert, setShowSignInAlert] = useState(false);

  const [showChoicesModal, setShowChoicesModal] = useState(null);

  const banners = [banner1, banner2, banner3];

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    role: "",
    eventId: "",
    eventTitle: "",
  });

  async function fetchEvents() {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/getAllEvents`);
      setEvents(data.events);
      setFilteredEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const closeeventmodal = () => setSelectedEvent(null);

  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    let filtered = [...events];

    if (searchText) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchText.toLowerCase()) ||
          e.description.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredEvents(filtered);
  }, [searchText, sortOrder, events]);

  const uid = Cookies.get("uid");
  const fullName = Cookies.get("fullname");
  const contact = Cookies.get("contact");

  async function handleRegisterEvent(eventId, eventTitle) {
    if (!uid || !fullName || !contact) {
      setShowSignInAlert(true);
      return;
    }

    try {
      const payload = {
        user_id: uid,
        name: fullName.trim(),
        contact: contact.toString().trim(),
        eventId: eventId || null,
        eventTitle: eventTitle || "General Volunteer",
        registration_type: "participant",
      };

      console.log("Register payload:", payload);

      await axios.post(`${API_URL}/addVolunteerWeb`, payload);

      alert("Successfully registered for the event!");
    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.message || "Failed to register. Please try again.";

      alert(message);
    }
  }

  async function handleVolunteerEvent(eventId, eventTitle) {
    if (!uid || !fullName || !contact) {
      setShowSignInAlert(true);
      return;
    }

    try {
      const payload = {
        user_id: uid,
        name: fullName.trim(),
        contact: contact.toString().trim(),
        eventId: eventId || null,
        eventTitle: eventTitle || "General Volunteer",
        registration_type: "volunteer",
      };

      console.log("Register payload:", payload);

      await axios.post(`${API_URL}/addVolunteerWeb`, payload);

      alert("Successfully volunteered for the event!");
    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.message || "Failed to register. Please try again.";

      alert(message);
    }
  }

  return (
    <>
      {/* EVENTS HEADER */}
      <section className="events-eventsheader">
        {banners.map((img, index) => (
          <div
            key={index}
            className={`eventsheader-bg ${index === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="eventsheader-overlay" />

        <div className="eventsheader-content">
          <span className="hero-eyebrow">Be part of us!</span>
          <h1 className="eventsheader-title">Discover Our Events</h1>
          <p className="eventsheader-subtitle">
            Stay updated with the latest happenings, programs, and activities.
          </p>
        </div>
      </section>

      {/* EVENTS LIST */}
      <section className="events-section">
        <div className="section-header">
          <h2>Upcoming Events</h2>
          <span className="divider" />

          <div className="events-filter-container">
            <div className="search-input-wrapper">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <button
              className="sort-toggle-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Sort by Newest" : "Sort by Oldest"}
            >
              {sortOrder === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )}
              <span>
                {sortOrder === "asc" ? "Oldest First" : "Newest First"}
              </span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-wrapper">
            <LoadingAnimation />
          </div>
        ) : filteredEvents.length === 0 ? (
          <p style={{ textAlign: "center" }}>No events found.</p>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event, index) => (
              <div key={event._id} className="event-card">
                <div
                  className="event-card-clickable"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="event-image">
                    <img
                      src={event.image ? event.image : noImage}
                      alt={event.title}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">
                      {event.description.length > 80
                        ? event.description.substring(0, 80) + "..."
                        : event.description}
                    </p>
                    <div className="event-meta">
                      <span className="event-location">{event.location}</span>
                      <span className="event-date">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="event-actions">
                  <button
                    className="register-btn"
                    onClick={() => {
                      if (!uid || !fullName || !contact) {
                        setShowSignInAlert(true);
                      } else {
                        setShowChoicesModal({
                          id: event._id,
                          title: event.title,
                          location: event.location,
                          date: event.date,
                        });
                      }
                    }}
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="eventmodal-overlay" onClick={closeeventmodal}>
          <div
            className="eventmodal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="eventmodal-close" onClick={closeeventmodal}>
              &times;
            </button>

            <div className="eventmodal-image-placeholder">
              <img
                src={selectedEvent.image ? selectedEvent.image : noImage}
                alt={selectedEvent.title}
                className="h-full aspect-square"
              />
            </div>

            <div className="eventmodal-body">
              <div className="event-header-row">
                <h2>{selectedEvent.title}</h2>
                {/* <button
                  className="register-btn"
                  style={{ width: '20%' }}
                  onClick={() => {

                    setShowChoicesModal(true);
                  }}
                >
                  Register Now
                </button> */}
              </div>
              <div className="eventmodal-meta">
                <strong>Location:</strong> {selectedEvent.location} <br />
                <strong>Date:</strong>{" "}
                {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <hr className="eventmodal-divider" />
              <p className="eventmodal-description-full">
                {selectedEvent.description &&
                selectedEvent.description.trim() !== ""
                  ? selectedEvent.description
                  : "No description displayed."}
              </p>
            </div>
          </div>
        </div>
      )}

      {showSignin && <SignInPage />}

      <Modal
        open={!!showChoicesModal}
        onCancel={() => setShowChoicesModal(null)}
        footer={null}
        centered
        width={400}
      >
        <div
          className="choicesmodal-header"
          style={{ textAlign: "center", marginBottom: "24px" }}
        >
          <span
            className="choicesmodal-label"
            style={{
              display: "block",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#a0a0a0",
              marginBottom: "8px",
            }}
          >
            Event Selection
          </span>
          <h2
            className="choicesmodal-title"
            style={{
              fontSize: "1.25rem",
              fontWeight: "500",
              margin: "0 0 8px 0",
            }}
          >
            {showChoicesModal?.title}
          </h2>
          <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
            {showChoicesModal?.location} •{" "}
            {showChoicesModal?.date &&
              new Date(showChoicesModal.date).toLocaleDateString()}
          </p>
        </div>

        <div
          className="choicesmodal-actions"
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <button
            className="border-btn"
            onClick={() => {
              setRegistrationData({
                role: "attendee",
                eventId: showChoicesModal.id,
                eventTitle: showChoicesModal.title,
                location: showChoicesModal.location,
                date: showChoicesModal.date,
              });
              setShowChoicesModal(null);
              setShowDetailsModal(true);
            }}
          >
            Attendee
          </button>

          <button
            className="border-btn"
            onClick={() => {
              setRegistrationData({
                role: "volunteer",
                eventId: showChoicesModal.id,
                eventTitle: showChoicesModal.title,
                location: showChoicesModal.location,
                date: showChoicesModal.date,
              });
              setShowChoicesModal(null);
              setShowDetailsModal(true);
            }}
          >
            Volunteer
          </button>
        </div>
      </Modal>

      <Modal
        title="Confirm Registration"
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={null}
        centered
        width={450}
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "20px" }}>
            Please review your details before submitting for{" "}
            <strong>{registrationData.eventTitle}</strong>.
          </p>

          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderLeft: "4px solid #FFC942",
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: "13px" }}>
              <strong>Place:</strong> {registrationData.location}
            </div>
            <div style={{ fontSize: "13px" }}>
              <strong>Time:</strong>{" "}
              {registrationData.date &&
                new Date(registrationData.date).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
            </div>
          </div>

          <div className="detail-item" style={{ marginBottom: "15px" }}>
            <label
              style={{ fontWeight: "600", display: "block", fontSize: "13px" }}
            >
              Full Name
            </label>
            <div
              style={{
                padding: "8px",
                background: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              {fullName || "N/A"}
            </div>
          </div>

          <div className="detail-item" style={{ marginBottom: "15px" }}>
            <label
              style={{ fontWeight: "600", display: "block", fontSize: "13px" }}
            >
              Contact Number
            </label>
            <div
              style={{
                padding: "8px",
                background: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              {contact || "N/A"}
            </div>
          </div>

          <div className="detail-item" style={{ marginBottom: "15px" }}>
            <label
              style={{ fontWeight: "600", display: "block", fontSize: "13px" }}
            >
              Selected Role
            </label>
            <div
              style={{
                padding: "8px",
                background: "#ffc9422f",
                border: "1px solid #FFC942",
                borderRadius: "4px",
                textTransform: "capitalize",
                color: "#d0a63b",
              }}
            >
              {registrationData.role}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              className="border-btn"
              style={{ padding: "8px" }}
              onClick={() => {
                if (registrationData.role === "attendee") {
                  handleRegisterEvent(
                    registrationData.eventId,
                    registrationData.eventTitle,
                  );
                } else {
                  handleVolunteerEvent(
                    registrationData.eventId,
                    registrationData.eventTitle,
                  );
                }
                setShowDetailsModal(false);
              }}
            >
              Confirm and Submit
            </button>
          </div>
        </div>
      </Modal>

      <SignInAlert
        open={showSignInAlert}
        onClose={() => setShowSignInAlert(false)}
        message="Please sign in to register for this event."
      />

      {showSignin && <SignInPage />}

      <Footer />
    </>
  );
}
