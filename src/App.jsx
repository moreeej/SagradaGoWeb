import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavbarContext } from "./context/AllContext";
import { useState } from "react";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import BookingPage from "./pages/BookingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";

import AdminLogin from "./pages/admin/AdminLogin";
import AddAdmin from "./pages/admin/AddAdmin";
import AdminLandingPage from "./pages/admin/AdminLandingPage";



function App() {
  const [selectedNavbar, setSelectedNavbar] = useState("Home");
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  return (
    <>
      <NavbarContext.Provider
        value={{
          selectedNavbar,
          setSelectedNavbar,
          showSignin,
          setShowSignin,
          showSignup,
          setShowSignup,
          currentUser,
          setCurrentUser,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLandingPage />} />
            <Route path="/admin/create" element={<AddAdmin />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </BrowserRouter>
      </NavbarContext.Provider>
    </>
  );
}

export default App;
