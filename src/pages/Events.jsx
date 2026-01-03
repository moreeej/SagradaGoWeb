import { useContext, useEffect, useState } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import axios from "axios";
import { API_URL } from "../Constants";
import LoadingAnimation from "../components/LoadingAnimation";
import "../styles/events.css";

import banner1 from "../assets/SAGRADA-FAMILIA-PARISH.jpg";
import banner2 from "../assets/christmas.jpg";
import banner3 from "../assets/dyd.jpg";

export default function Events() {
  const { showSignin } = useContext(NavbarContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

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

  // Banner slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    let filtered = [...events];

    if (searchText) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchText.toLowerCase()) ||
          e.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [searchText, locationFilter, dateFilter, events]);

  // Near your other useState hooks
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Function to close the eventmodal
  const closeeventmodal = () => setSelectedEvent(null);

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

          {/* FILTER & SEARCH */}
          <div className="events-filter-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              /> */}

            {/* <button
                className="filled-btn"
                style={{ padding: '10px 16px' }}
                onClick={() => {
                  setSearchText("");
                  setLocationFilter("");
                  setDateFilter("");
                }}
              >
                Reset
              </button> */}
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
              <div
                key={event._id}
                className="event-card"
                style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }} // Add pointer cursor
                onClick={() => setSelectedEvent(event)} // Set the clicked event
              >
                <div className="event-image">
                  <span>Event Image</span>
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
            ))}
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="eventmodal-overlay" onClick={closeeventmodal}>
          <div className="eventmodal-content" onClick={(e) => e.stopPropagation()}>
            <button className="eventmodal-close" onClick={closeeventmodal}>&times;</button>

            <div className="eventmodal-image-placeholder">
              <span>Event Image</span>
            </div>

            <div className="eventmodal-body">
              <h2>{selectedEvent.title}</h2>
              <div className="eventmodal-meta">
                <strong>Location:</strong> {selectedEvent.location} <br />
                <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric"
                })}
              </div>
              <hr className="eventmodal-divider" />
              <p className="eventmodal-description-full">
                {selectedEvent.description && selectedEvent.description.trim() !== ""
                  ? selectedEvent.description
                  : "No description displayed."}
              </p>
            </div>
          </div>
        </div>
      )}

      {showSignin && <SignInPage />}
    </>
  );
}
