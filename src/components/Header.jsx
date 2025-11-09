import { useContext } from "react";
import Button from "./Button";
import NavButton from "./NavButton";
import { NavbarContext } from "../context/AllContext";
import "../styles/header.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";


export default function Header() {
  const { setSelectedNavbar, setShowSignin } = useContext(NavbarContext);
  const navigate = useNavigate()
  const email = Cookies.get("email");
  
  const navbar = [
    { text: "Home" },
    { text: "Book A Service" },
    { text: "Events" },
    { text: "Be a Volunteer" },
    { text: "Donate" },
  ];

  

  return (
    <div className="header-main-container">
      <div className="header-logo"></div>

      <div className="navbar-container">
        {navbar.map((elem) => (
          <NavButton
            key={elem.text}
            text={elem.text}
            onClick={() => setSelectedNavbar(elem.text)}
          />
        ))}
      </div>

      <div className="signin-container">
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-black">
              Welcome, <strong>{email}</strong>
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
