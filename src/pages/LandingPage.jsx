import { useContext } from "react";
import "../styles/home.css"
import { NavbarContext } from "../context/AllContext";

import SignInPage from "./SignInPage";



export default function LandingPage() {
  const { showSignin } = useContext(NavbarContext);
  

  return (
    <>
      <div className="home-main-container">
        <div className="w-full h-1000">

        </div>
      </div>

      {
        showSignin && 
        <SignInPage />
      }
    </>

  );
}
