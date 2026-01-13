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

import {
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export default function BeVolunteer() {
  const { showSignin } = useContext(NavbarContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showSignInAlert, setShowSignInAlert] = useState(false);



  const banners = [banner1, banner2, banner3];


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
          e.description.toLowerCase().includes(searchText.toLowerCase())
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
        registration_type: "volunteer"
      };

      console.log("Register payload:", payload);

      await axios.post(`${API_URL}/addVolunteerWeb`, payload);

      alert("Successfully volunteered for the event!");

    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to register. Please try again.";

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
              <div className="flex flex-col event-card">
                <div
                  key={event._id}
                  className=""
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    cursor: "pointer",
                  }}
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
                      {event.description.length > 50
                        ? event.description.substring(0, 80) + ".."
                        : event.description}
                    </p>
                    <div className="event-meta">
                      <span>{event.location}</span>
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "long",
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
                    onClick={() => handleVolunteerEvent(event._id, event.title)}
                  >
                    Volunteer
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
              <h2>{selectedEvent.title}</h2>
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

      <SignInAlert 
        open={showSignInAlert} 
        onClose={() => setShowSignInAlert(false)} 
        message="Please sign in to register for this event." 
      />

      <Footer />
    </>
  );
}
