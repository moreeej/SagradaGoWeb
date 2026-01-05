import "../styles/navButton.css";
import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";



export default function NavButton({
  id,
  text,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const {
    selectedNavbar,
    activeDropdown,
    setActiveDropdown,
    setBookingSelected,
    setShowSignin,
    setShowSignup,

  } = useContext(NavbarContext);
  const navigate = useNavigate();

  const email = Cookies.get("email");



  const dropdownServices = [
    { name: "Wedding", id: "wedding", path: "/book-service" },
    { name: "Baptism", id: "baptism", path: "/book-service" },
    { name: "Confession", id: "confession", path: "/book-service" },
    { name: "Anointing of the Sick", id: "anointing", path: "/book-service" },
    { name: "First Communion", id: "communion", path: "/book-service" },
    { name: "Burial", id: "burial", path: "/book-service" },
  ];

  const handleDropdownClick = (path, serviceText) => {
    setActiveDropdown(false);
    setBookingSelected(serviceText);
    navigate(path);
    setShowSignin(false);
    setShowSignup(false);
  };

  const dropdownMenu = (
    <div
      className="dropdown-container"
      onMouseEnter={() => setActiveDropdown(true)}
      onMouseLeave={() => setActiveDropdown(false)}
    >
      {dropdownServices.map((service) => (
        <a
          key={service.id}
          href={service.path}
          onClick={(e) => {
            if(email){
              e.preventDefault();
              handleDropdownClick(service.path, service.id);
            }
            else{
              alert("Please sign in to continue.");
              e.preventDefault();
            }
            
          }}
        >
          {service.name}
        </a>
      ))}
    </div>
  );

  const shouldShowDropdown = activeDropdown && id === "book";

  return (
    <div className="nav-container relative">
      <button
        className={`nav-button ${selectedNavbar === id ? "underline" : ""}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {text}
      </button>

      {shouldShowDropdown && dropdownMenu}
    </div>
  );
}
