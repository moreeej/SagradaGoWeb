/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import NavButton from "./NavButton";
import { NavbarContext } from "../context/AllContext";
import "../styles/header.css";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/sagrada.png";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export default function Header() {
  const { setSelectedNavbar, setShowSignin, setShowSignup, setActiveDropdown, setBookingSelected } =
    useContext(NavbarContext);
  const navigate = useNavigate();
  const email = Cookies.get("email");
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  console.log("email", email);
  
  

  const navbar = [
    { id: "home", text: "Home", path: "/" },
    { id: "book", text: "Book A Service", path: "/book-service" },
    { id: "event", text: "Events", path: "/events" },
    { id: "volunteer", text: "Be a Volunteer", path: "/be-volunteer" },
    // { id: "donate", text: "Donate", path: "/donate" },
  ];

  useEffect(() => {
    const currentNavItem = navbar.find(
      (elem) =>
        elem.path === location.pathname ||
        (elem.id === "book" && location.pathname.startsWith("/book"))
    );
    if (currentNavItem) {
      setSelectedNavbar(currentNavItem.id);
    }
  }, [location.pathname, setSelectedNavbar, navbar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleMouseEnter(id) {
    if (id === "book") setActiveDropdown(true);
  }

  function handleMouseLeave(id) {
    if (id === "book") setActiveDropdown(false);
  }

  return (
    <div className="header-main-container">
      <img
        src={Logo}
        alt="Logo"
        className="header-logo"
        onClick={() => navigate("/")}
      />

      <div className="navbar-container">
        {navbar.map((elem) => (
          <NavButton
            id={elem.id}
            key={elem.text}
            text={elem.text}
            onClick={() => {
            if (!email && elem.id === "volunteer") {
              alert("Please sign in to continue.");
              return; 
            }

            setSelectedNavbar(elem.id);
            navigate(elem.path);
            setShowSignin(false);

            if (elem.id === "book") setBookingSelected(null);
          }}

            onMouseEnter={() => handleMouseEnter(elem.id)}
            onMouseLeave={() => handleMouseLeave(elem.id)}
          />
        ))}
      </div>

      <div className="signin-container">
        {email ? (
          <div className="profile-dropdown-container">
            <div
              className="profile-pic"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <FaUser size={18} />
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileDropdown(false);
                  }}
                >
                  Settings
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    Modal.confirm({
                      title: 'Confirm Logout',
                      icon: <ExclamationCircleOutlined />,
                      content: 'Are you sure you want to log out?',
                      okText: 'Logout',
                      okType: 'danger',
                      cancelText: 'Cancel',
                      onOk() {
                        Cookies.remove("email");
                        localStorage.removeItem("currentUser");
                        navigate("/");
                        window.location.reload();
                      },
                    });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="border-btn"
            style={{ padding: "8px 15px", fontSize: "14px " }}
            onClick={() => {
              setShowSignin(true)
              setShowSignup(false)
            }}
          >
            Sign In
          </button>
        )}
      </div>

      <Modal
        title="Confirm Logout"
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ExclamationCircleOutlined style={{ fontSize: '42px', color: '#faad14', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#555' }}>
            Are you sure you want to log out of your account?
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              className="border-btn"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="filled-btn"
              onClick={() => {
                Cookies.remove("email");
                localStorage.removeItem("currentUser");
                navigate("/");
                window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
