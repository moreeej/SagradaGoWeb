/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import NavButton from "./NavButton";
import { NavbarContext } from "../context/AllContext";
import "../styles/header.css";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/sagrada.png";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import VirtualTour from "./VirtualTour";

const navbar = [
  { id: "home", text: "Home", path: "/" },
  { id: "book", text: "Book A Service", path: "/book-service" },
  { id: "event", text: "Events", path: "/events" },
];

export default function Header() {
  const { setSelectedNavbar, setShowSignin, setShowSignup, setBookingSelected } = useContext(NavbarContext);
  const navigate = useNavigate();
  const email = Cookies.get("email");
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setSelectedNavbar("home");
    }
  }, []);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    setIsMenuOpen(false);
    Modal.confirm({
      title: 'Confirm Logout',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to log out?',
      onOk() {
        Cookies.remove("email");
        Cookies.remove("uid");
        localStorage.removeItem("currentUser");
        navigate("/");
        window.location.reload();
      },
    });
  };

  const AuthSection = ({ isMobile = false }) => (
    <div className={isMobile ? "mobile-auth-wrapper" : "signin-container"}>
      {email ? (
        <div className={isMobile ? "mobile-profile-list" : "profile-dropdown-container"}>
          {!isMobile && (
            <div className="profile-pic" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
              <FaUser size={18} />
            </div>
          )}

          {(showProfileDropdown || isMobile) && (
            <div className={isMobile ? "mobile-list-content" : "profile-dropdown"}>
              <button className="dropdown-item" onClick={() => { navigate("/profile"); setShowProfileDropdown(false); setIsMenuOpen(false); }}>Profile</button>
              <button className="dropdown-item" onClick={() => { navigate("/activity"); setShowProfileDropdown(false); setIsMenuOpen(false); }}>Activity</button>
              <button className="dropdown-item logout-red" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <button className="border-btn" style={{ padding: '8px 12px' }} onClick={() => { setShowSignin(true); setShowSignup(false); setIsMenuOpen(false); }}>
          Sign In
        </button>
      )}
    </div>
  );

  return (
    <div className="header-main-container">
      <img src={Logo} alt="Logo" className="header-logo" onClick={() => navigate("/")} />

      <div className="hamburger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </div>

      {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <div className={`navbar-container ${isMenuOpen ? "mobile-active" : ""}`}>
        {navbar.map((elem) => (
          <NavButton
            id={elem.id}
            key={elem.id}
            text={elem.text}
            onClick={() => {
              setSelectedNavbar(elem.id);
              navigate(elem.path);
              if (elem.id === "book") setBookingSelected(null);
            }}
          />
        ))}
        <NavButton id="virtual-tour" text="Virtual Tour" onClick={() => setShowVirtualTour(true)} />

        {/* Mobile Auth Section (Inside Drawer) */}
        <AuthSection isMobile={true} />
      </div>

      {/* Desktop Auth Section (Outside Drawer) */}
      <AuthSection isMobile={false} />

      <VirtualTour isOpen={showVirtualTour} onClose={() => setShowVirtualTour(false)} />
    </div>
  );
}