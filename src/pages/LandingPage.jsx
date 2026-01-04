import { useContext, useState, useRef } from "react";
import "../styles/home.css";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import Footer from '../components/Footer';
import { Modal, Button, ConfigProvider } from "antd";
import {
  CompassOutlined,
  BankOutlined,
  TeamOutlined,
  FormOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

import parishImg from '../assets/SAGRADA-FAMILIA-PARISH.jpg';
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const { showSignin } = useContext(NavbarContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const aboutRef = useRef(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#FFC942' } }}>
      <div className="home-main-container">

        {/* 1. HERO SECTION */}
        <section className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-left-box">
                <span className="welcome-tag">Welcome To</span>
                <h1 className="hero-title">Sagrada<br />Familia<br />Parish</h1>
              </div>

              <div className="hero-right-box">
                <p className="hero-description">
                  A community of faith, hope, and love in the heart of Bacoor.
                  Join us in worship and celebrate the holy sacraments.
                </p>
                <div className="hero-btns">
                  <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <ClockCircleOutlined />
                    View Mass Schedule
                  </button>

                  <button className="btn-outline" onClick={scrollToAbout}>
                    <TeamOutlined />
                    About Our Parish
                  </button>
                </div>
              </div>
            </div>
          </div>
          <img src={parishImg} alt="Parish View" className="hero-bg-img" />
        </section>

        {/* 2. ABOUT OUR PARISH - Split Grid */}
        <section ref={aboutRef} className="about-section">
          <div className="about-grid">
            <div className="about-image-stack">
              <img src={parishImg} alt="Parish History" className="img-main" />
              <div className="img-accent-frame"></div>
            </div>
            <div className="about-info">
              <span className="accent-text" style={{ fontSize: 25 }}>Our Legacy</span>
              <p style={{ marginTop: 20 }}>Founded on the principles of the Holy Family, Sagrada Familia Parish has been a spiritual home for generations. We are dedicated to fostering a deep connection with the divine through our liturgical celebrations.</p>
              <div className="about-stats">
                <div className="stat-item">
                  <TeamOutlined className="stat-icon" />
                  <div>
                    <strong>5,000+</strong>
                    <p>Parishioners</p>
                  </div>
                </div>
                <div className="stat-item">
                  <EnvironmentOutlined className="stat-icon" />
                  <div>
                    <strong>Established</strong>
                    <p>Community Roots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURED CONTENT - Service Grid */}
        <section className="featured-section">
          <div className="section-header">
            <span className="accent-text">Community Engagement</span>
            <h2>How to Get Involved</h2>
            <div style={{
              width: "60px",
              height: "4px",
              background: "#FFC942",
              margin: "15px auto",
              borderRadius: "10px"
            }} />
          </div>

          <div className="feature-grid">
            {/* Daily Mass - Now triggers the Schedule Modal */}
            <div className="feature-item" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
              <BankOutlined className="feature-icon-ant" />
              <h3>Daily Mass</h3>
              <p>Join us in daily celebration of the Eucharist at our parish altar.</p>
              <span className="feature-link">View Hours <ArrowRightOutlined /></span>
            </div>

            {/* Join a Ministry - Now navigates to Be a Volunteer page */}
            <div className="feature-item" onClick={() => navigate("/be-volunteer")} style={{ cursor: 'pointer' }}>
              <TeamOutlined className="feature-icon-ant" />
              <h3>Join a Ministry</h3>
              <p>Share your god-given talents with our choir, youth, or service groups.</p>
              <span className="feature-link">Volunteer <ArrowRightOutlined /></span>
            </div>

            {/* Online Booking - Now navigates to Book a Service page */}
            <div className="feature-item" onClick={() => navigate("/book-service")} style={{ cursor: 'pointer' }}>
              <FormOutlined className="feature-icon-ant" />
              <h3>Online Booking</h3>
              <p>Schedule weddings, baptisms, and other sacraments through our portal.</p>
              <span className="feature-link">Book Now <ArrowRightOutlined /></span>
            </div>
          </div>
        </section>

        {/* 4. VIRTUAL TOUR - Creative Dark Section */}
        <section className="virtual-tour-container">
          <div className="tour-content">
            <div className="tour-text">
              <CompassOutlined className="section-icon-top" />
              <span className="accent-label">Digital Sanctuary</span>
              <p>Take a spiritual journey through our sacred halls with our interactive 360° virtual tour, designed for those who cannot join us in person.</p>
              <button className="tour-cta">
                <PlayCircleOutlined /> Enter Virtual Tour
              </button>
            </div>
            <div className="tour-visual">
              <div className="visual-glass-card">
                <div className="pulse-point"></div>
                <p>Interactive View Ready</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Mass Schedule Modal */}
      <Modal
        title={<span><ClockCircleOutlined /> Mass Schedule & Services</span>}
        open={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <div className="schedule-modal-content">
          <div className="schedule-block">
            <h4>Weekday Schedule</h4>
            <p><strong>Mon - Fri:</strong> 6:00 AM | 6:00 PM</p>
            <p className="novena-info"><strong>Wednesday:</strong> Perpetual Help Novena (Before Mass)</p>
          </div>

          <div className="schedule-block">
            <h4>Sunday Masses</h4>
            <p><strong>Morning:</strong> 6:00 AM | 8:00 AM | 10:00 AM <span className="tag-high-mass">High Mass</span></p>
            <p><strong>Afternoon:</strong> 4:00 PM | 6:00 PM</p>
          </div>

          <div className="schedule-block">
            <h4>Devotions</h4>
            <p><strong>First Friday:</strong> Sacred Heart Devotion</p>
            <p><strong>First Saturday:</strong> Dawn Procession & Rosary</p>
          </div>
        </div>
      </Modal>
      {showSignin && <SignInPage />}
      <Footer />
    </ConfigProvider>
  );
}