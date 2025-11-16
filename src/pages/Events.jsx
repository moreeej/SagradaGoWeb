import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";


export default function Events() {
  const { showSignin } = useContext(NavbarContext);
  return (
    <>
      <h1>Events</h1>
      {showSignin && <SignInPage />}
    </>
  );
}
