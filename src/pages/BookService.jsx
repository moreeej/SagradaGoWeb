import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import Wedding from "./Bookings/Wedding";
import Baptism from "./Bookings/Baptism";
import Confession from "./Bookings/Confession";
import Anointing from "./Bookings/Anointing";
import Communion from "./Bookings/Communion";
import Burial from "./Bookings/Burial";
import Footer from '../components/Footer';

import {
  HeartOutlined,
  UserAddOutlined,
  ReadOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";

import parishHero from '../assets/360pews.jpg';

export default function BookService() {
  const { showSignin, bookingSelected, setBookingSelected } = useContext(NavbarContext);

  const serviceDetails = {
    wedding: { title: "Sacrament of Matrimony", desc: "Plan your holy union. Ensure baptismal certificates are ready for upload.", icon: <HeartOutlined /> },
    baptism: { title: "Sacrament of Baptism", desc: "Welcome a new member into the Christian community with open arms.", icon: <UserAddOutlined /> },
    confession: { title: "Sacrament of Reconciliation", desc: "Schedule private spiritual healing and confession with our parish priest.", icon: <SafetyCertificateOutlined /> },
    anointing: { title: "Anointing of the Sick", desc: "Request spiritual comfort and healing for the elderly or seriously ill.", icon: <MedicineBoxOutlined /> },
    communion: { title: "First Holy Communion", desc: "Register for the Eucharist. Completion of catechism is usually required.", icon: <ReadOutlined /> },
    burial: { title: "Funeral & Burial Services", desc: "Arrange a respectful Catholic send-off for your loved ones.", icon: <EnvironmentOutlined /> },
  };

  const currentService = serviceDetails[bookingSelected] || { title: "", desc: "" };

  return (
    <div className="book-service-main-wrapper">
      {/* 1. LANDING STATE */}
      {!bookingSelected && (
        <>
          <div className="services-hero-wrapper">
            <img src={parishHero} alt="Parish background" className="services-hero-bg" />
            <div className="services-hero-overlay" />
            <div className="services-hero-content">
              <span className="hero-eyebrow">Sacramental Life</span>
              <h1 className="landing-title">Parish Services</h1>
              <div className="accent-separator" />
              <p className="hero-subtitle">
                Experience the grace of the sacraments. Select a path to begin your
                spiritual journey and join our community in faith.
              </p>
            </div>
          </div>

          <div className="landing-container">
            <div className="landing-section">
              <div className="services-grid">
                {Object.keys(serviceDetails).map((key, index) => (
                  <div
                    key={key}
                    className="service-card"
                    onClick={() => setBookingSelected(key)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="floating-icon-wrapper">
                      {serviceDetails[key].icon}
                    </div>
                    <h3 style={{
                      fontWeight: "800",
                      fontSize: "1.3rem",
                      marginBottom: "15px",
                      color: "#2c3e50",
                      letterSpacing: "-0.5px"
                    }}>
                      {serviceDetails[key].title}
                    </h3>
                    <p style={{
                      fontSize: "0.95rem",
                      color: "#7f8c8d",
                      lineHeight: "1.7",
                      padding: "0 10px"
                    }}>
                      {serviceDetails[key].desc}
                    </p>

                    <div style={{
                      marginTop: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#FFC942",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>
                      Get Started →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-section">
              <div className="info-container">
                <div className="info-text">
                  <h2>Simplified Booking</h2>
                  <p style={{ color: "#7f8c8d", marginBottom: '30px' }}>We have modernized our process to help you prepare for your sacraments with ease.</p>

                  <div className="step-card">
                    <div className="step-num">1</div>
                    <div>
                      <h4 style={{ fontWeight: '700' }}>Choose Sacrament</h4>
                      <p style={{ fontSize: '0.9rem', color: '#95a5a6' }}>Pick the service you need and read the requirements.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-num">2</div>
                    <div>
                      <h4 style={{ fontWeight: '700' }}>Upload Documents</h4>
                      <p style={{ fontSize: '0.9rem', color: '#95a5a6' }}>Submit digital copies of certificates directly through the app.</p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-num">3</div>
                    <div>
                      <h4 style={{ fontWeight: '700' }}>Receive Schedule</h4>
                      <p style={{ fontSize: '0.9rem', color: '#95a5a6' }}>Our office will contact you once your documents are verified.</p>
                    </div>
                  </div>
                </div>

                <div className="info-image">
                  <img
                    src={parishHero}
                    alt="Sagrada Familia Parish"
                    className="landing-info-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. ACTIVE BOOKING STATE */}
      {bookingSelected && (
        <div className="booking-form-view">
          <div className="service-header">
            <button className="back-button" onClick={() => setBookingSelected(null)}>
              <span className="back-icon-container"><ArrowLeftOutlined /></span>
              Back to Services
            </button>
            <h1>{currentService.title}</h1>
            <p>{currentService.desc}</p>
            <div className="accent-separator" style={{ margin: "20px auto" }} />
          </div>

          <div className="form-content-container">
            {bookingSelected === "wedding" && <Wedding />}
            {bookingSelected === "baptism" && <Baptism />}
            {bookingSelected === "confession" && <Confession />}
            {bookingSelected === "anointing" && <Anointing />}
            {bookingSelected === "communion" && <Communion />}
            {bookingSelected === "burial" && <Burial />}
          </div>
        </div>
      )}

      {showSignin && <SignInPage />}
      <Footer />
    </div>
  );
}