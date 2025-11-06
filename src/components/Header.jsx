import { useContext } from "react";
import Button from "./Button";
import NavButton from "./NavButton";
import { NavbarContext } from "../context/AllContext";
import "../styles/header.css"

export default function Header() {
  const { setSelectedNavbar } = useContext(NavbarContext);
  const navbar = [
    {
      text: "Home",
    },

    {
      text: "Book A Service",
    },
    {
      text: "Events",
    },
    {
      text: "Be a Volunteer",
    },
    {
      text: "Donate",
    },
  ];
  return (
    <>
      <div className="header-main-container">
        <div className="header-logo"></div>

        <div className="navbar-container">
          {navbar.map((elem) => (
            <NavButton 
                text={elem.text} 
                onClick={() => setSelectedNavbar(elem.text)}
            />
          ))}
        </div>

        <div className="signin-container">
          <Button text={"Sign in"} color={"#6B5F32"} textColor={"#ffffff"} />
        </div>
      </div>
    </>
  );
}
