import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavbarContext } from "./context/AllContext";
import { useState } from "react";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import BookingPage from "./pages/BookingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import BookService from "./pages/BookService";
import Events from "./pages/Events";
import BeVolunteer from "./pages/BeVolunteer";
import Donate from "./pages/Donate";

import AdminLogin from "./pages/admin/AdminLogin";
import AddAdmin from "./pages/admin/AddAdmin";
import AdminLandingPage from "./pages/admin/AdminLandingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountManagement from "./pages/admin/AccountManagement";

import Header from "./components/Header";
import AdminLayout from "./components/AdminLayout";

function App() {
  const [selectedNavbar, setSelectedNavbar] = useState("Home");
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [bookingSelected, setBookingSelected] = useState(false);

  return (
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
        activeDropdown,
        setActiveDropdown,
        bookingSelected,
        setBookingSelected
      }}
    >
      <BrowserRouter>
        <Routes>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="account-management" element={<AccountManagement />} />
            <Route path="" element={<AdminDashboard />} />
            <Route path="create" element={<AddAdmin />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="main-container">
                <Header />
                <div className="body-container">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/sign-up" element={<SignUpPage />} />
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/book-service" element={<BookService />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/be-volunteer" element={<BeVolunteer />} />
                  <Route path="/donate" element={<Donate />} />
                </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </NavbarContext.Provider>
  );
}

export default App;
