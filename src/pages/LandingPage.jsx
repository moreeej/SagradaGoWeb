import { useContext } from "react";
import Header from "../components/Header";
import "../styles/home.css"
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";



export default function LandingPage() {
  const { showSignin } = useContext(NavbarContext);
  

  return (
    <>
      <div className="home-main-container">
        <Header />

        <div className="w-full h-[1000px] bg-pink-500">

        </div>
      </div>

      {
        showSignin && 
        <SignInPage />
      }
    </>

  );
}
