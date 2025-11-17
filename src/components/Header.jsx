import { useContext } from "react";
import Button from "./Button";
import NavButton from "./NavButton";
import { NavbarContext } from "../context/AllContext";
import "../styles/header.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";


export default function Header() {
  const { setSelectedNavbar, setShowSignin, currentUser } = useContext(NavbarContext);
  const navigate = useNavigate()
  const email = Cookies.get("email");

  
  const navbar = [
    { text: "Home", path: "/" },
    { text: "Book A Service", path: "/book-service" },
    { text: "Events", path: "/events" },
    { text: "Be a Volunteer", path: "/be-volunteer" },
    { text: "Donate", path: "/donate" },
  ];

  

  return (
    <div className="header-main-container">
      <div className="header-logo"></div>

      <div className="navbar-container">
        {navbar.map((elem) => (
          <NavButton
            key={elem.text}
            text={elem.text}
            onClick={() => {
              setSelectedNavbar(elem.text)
              navigate(elem.path)
            }}

          />
        ))}
      </div>

      <div className="signin-container">
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-black">
              Welcome, <strong>{currentUser.data.first_name}</strong>
            </span>
            <Button
              text={"Logout"}
              color={"#b87d3e"}
              textColor={"#ffffff"}
              onClick={() => {
                Cookies.remove("email");
                navigate("/")
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
