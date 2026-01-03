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
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  const banners = [banner1, banner2, banner3];

  async function fetchEvents() {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/getAllEvents`);
      setEvents(data.events);
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

  return (
    <>
      {/* EVENTS HEADER */}
      <section className="events-eventsheader">
        {banners.map((img, index) => (
          <div
            key={index}
            className={`eventsheader-bg ${index === current ? "active" : ""
              }`}
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
        </div>

        {isLoading ? (
          <div className="loading-wrapper">
            <LoadingAnimation />
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event, index) => (
              <div
                key={event._id}
                className="event-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="event-image">
                  <span>Event Image</span>
                </div>

                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>

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

      {showSignin && <SignInPage />}
    </>
  );
}