import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { NavbarContext } from "../context/AllContext";
import Cookies from "js-cookie";
import Logo from "../assets/sagrada.png";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useContext(NavbarContext);

  const menuItems = [
    { id: "dashboard", text: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { id: "account", text: "Account Management", path: "/admin/account-management", icon: "👥" },
  ];

  const handleLogout = () => {
    Cookies.remove("email");
    setCurrentUser({});
    navigate("/admin/login");
    window.location.reload();
  };

  return (
    <div className="w-64 h-screen bg-[#b87d3e] text-white flex flex-col shadow-lg fixed left-0 top-0">
      <div className="p-6 border-b border-white/20">
        <img
          src={Logo}
          alt="Logo"
          className="h-12 w-auto cursor-pointer"
          onClick={() => navigate("/admin/dashboard")}
        />
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-[#b87d3e] font-semibold"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

