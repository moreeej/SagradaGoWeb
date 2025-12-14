import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { NavbarContext } from "./context/AllContext";
import { useState } from "react";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import BookService from "./pages/BookService";
import Events from "./pages/Events";
import BeVolunteer from "./pages/BeVolunteer";
import Donate from "./pages/Donate";

import AdminLogin from "./pages/admin/AdminLogin";
import AddAdmin from "./pages/admin/AddAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountManagement from "./pages/admin/AccountManagement";
import BookingPendingRequests from "./pages/admin/BookingPendingRequests";
import DonationsList from "./pages/admin/DonationsList";
import VolunteersList from "./pages/admin/VolunteersList";
import AddEvents from "./pages/admin/AddEvents";
import Header from "./components/Header";
import AdminLayout from "./components/AdminLayout";
import AdminAnnouncements from "./pages/admin/AdminAnnouncement";
import AdminChat from "./components/AdminChat";

function AppContent() {
  const location = useLocation();

  // Hide header on admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}

      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="account-management" element={<AccountManagement />} />
          <Route path="bookings" element={<BookingPendingRequests />} />
          <Route path="donations" element={<DonationsList />} />
          <Route path="volunteers" element={<VolunteersList />} />
          <Route path="events" element={<AddEvents />} />
          <Route path="create" element={<AddAdmin />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/book-service" element={<BookService />} />
        <Route path="/events" element={<Events />} />
        <Route path="/be-volunteer" element={<BeVolunteer />} />
        <Route path="/donate" element={<Donate />} />
      </Routes>
    </>
  );
}

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
        setBookingSelected,
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </NavbarContext.Provider>
  );
}

export default App;
