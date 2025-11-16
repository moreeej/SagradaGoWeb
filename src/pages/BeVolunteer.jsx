import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";


export default function BeVolunteer() {
  const { showSignin } = useContext(NavbarContext);
  return (
    <>
      <h1>BeVolunteer</h1>
      {showSignin && <SignInPage />}
    </>
  );
}
