/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import NavButton from "./NavButton";
import { NavbarContext } from "../context/AllContext";
import "../styles/header.css";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/sagrada.png";

export default function Header() {
  const { setSelectedNavbar, setShowSignin, currentUser, setActiveDropdown } =
    useContext(NavbarContext);
  const navigate = useNavigate();
  const email = Cookies.get("email");
  const location = useLocation();

  const navbar = [
    { id: "home", text: "Home", path: "/" },
    { id: "book", text: "Book A Service", path: "/book" },
    { id: "event", text: "Events", path: "/events" },
    { id: "volunteer", text: "Be a Volunteer", path: "/be-volunteer" },
    { id: "donate", text: "Donate", path: "/donate" },
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

  function handleMouseEnter(id) {
    if (id === "book") setActiveDropdown(true);
  }

  function handleMouseLeave(id) {
    if (id === "book") setActiveDropdown(false);
  }

  return (
    <div className="header-main-container">
      {/* Left: Logo */}
      <img
        src={Logo}
        alt="Logo"
        className="header-logo"
        onClick={() => navigate("/")}
      />

      {/* Center: Navbar */}
      <div className="navbar-container">
        {navbar.map((elem) => (
          <NavButton
            id={elem.id}
            key={elem.text}
            text={elem.text}
            onClick={() => {
              setSelectedNavbar(elem.id);
              if (elem.id !== "book") navigate(elem.path);
            }}
            onMouseEnter={() => handleMouseEnter(elem.id)}
            onMouseLeave={() => handleMouseLeave(elem.id)}
          />
        ))}
      </div>

      {/* Right: Sign-in / Logout */}
      <div className="signin-container">
        {email ? (
          <button
            className="p-2 rounded hover:bg-gray-200 transition"
            title="Logout"
            onClick={() => {
              Cookies.remove("email");
              navigate("/");
              window.location.reload();
            }}
          >
            <FaSignOutAlt size={18} color="#b87d3e" />
          </button>
        ) : (
          <button
            className="px-4 py-2 rounded text-white bg-[#6B5F32] text-[14px] font-medium hover:opacity-90 transition"
            onClick={() => setShowSignin(true)}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
