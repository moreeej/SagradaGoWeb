import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";


export default function BookService() {
  const { showSignin } = useContext(NavbarContext);
  return (
    <>
      <h1>Book service</h1>

      {showSignin && <SignInPage />}
    </>
  );
}
