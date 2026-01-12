import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { NavbarContext } from "./context/AllContext";
import { useState, useEffect } from "react";
import "./App.css";
import SessionTimeout from "./components/SessionTimeout";

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
import AdminLogs from "./pages/admin/AdminLogs";
import AdminChat from "./components/AdminChat";
import Notifications from "./components/Notifications";
import FloatingButton from "./components/FloatingButton";
import ProfilePage from "./pages/ProfilePage";

function AppContent() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}
      {!isAdminRoute && <FloatingButton />}
      
      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="account-management" element={<AccountManagement />} />
          <Route path="bookings" element={<BookingPendingRequests />} />
          <Route path="donations" element={<DonationsList />} />
          <Route path="volunteers" element={<VolunteersList />} />
          <Route path="events" element={<AddEvents />} />
          <Route path="create" element={<AddAdmin />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/book-service" element={<BookService />} />
        <Route path="/events" element={<Events />} />
        <Route path="/be-volunteer" element={<BeVolunteer />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

function App() {
  const [selectedNavbar, setSelectedNavbar] = useState("Home");
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [bookingSelected, setBookingSelected] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem("currentUser");
      const sessionTimeout = localStorage.getItem("sessionTimeout");

      if (!storedUser || !sessionTimeout) {
        if (storedUser || sessionTimeout) {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("sessionTimeout");
          setCurrentUser(null);
        }

        return;
      }

      const timeoutTime = parseInt(sessionTimeout);
      if (isNaN(timeoutTime) || Date.now() >= timeoutTime) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("sessionTimeout");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPosition");
        setCurrentUser(null);

        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        if (JSON.stringify(parsedUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(parsedUser);
        }

      } catch (error) {
        console.error("Error parsing currentUser:", error);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("sessionTimeout");
        setCurrentUser(null);
      }
    };

    checkSession();

    const handleStorageChange = (e) => {
      if (e.key === "currentUser" || e.key === "sessionTimeout") {
        checkSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
        <SessionTimeout />
        <AppContent />
      </BrowserRouter>
    </NavbarContext.Provider>
  );
}

export default App;
