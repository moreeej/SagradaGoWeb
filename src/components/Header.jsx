/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import Button from "./Button";
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
    if (id === "book") {
      setActiveDropdown(true);
    }
  }

  function handleMouseLeave(id) {
    if (id === "book") {
      setActiveDropdown(false);
    }
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
              setSelectedNavbar(elem.id);
              if (elem.id !== "book") {
                navigate(elem.path);
              }
            }}
            onMouseEnter={() => handleMouseEnter(elem.id)}
            onMouseLeave={() => handleMouseLeave(elem.id)}
          />
        ))}
      </div>

      <div className="signin-container">
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-black">
              Welcome,<strong>{currentUser?.data?.first_name}</strong>
            </span>
            <Button
              text={"Logout"}
              color={"#b87d3e"}
              textColor={"#ffffff"}
              onClick={() => {
                Cookies.remove("email");
                navigate("/");

                window.location.reload();
              }}
            />
          </div>
        ) : (
          <Button
            text={"Sign in"}
            color={"#6B5F32"}
            textColor={"#ffffff"}
            onClick={() => setShowSignin(true)}
          />
        )}
      </div>
    </div>
  );
}
