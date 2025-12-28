import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Navbar({ setOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  /* ===== PAGE TITLE BASED ON ROUTE ===== */
  const getTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname.includes("/dashboard/weekly"))
      return "Weekly Contributions";
    if (location.pathname.includes("/dashboard/donations"))
      return "Donations";
    if (location.pathname.includes("/dashboard/expenses"))
      return "Expenses";
    if (location.pathname.includes("/dashboard/reports"))
      return "Reports";
    if (location.pathname.includes("/dashboard/members"))
      return "Members";
    return "Dashboard";
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>

        <h1 className="font-semibold text-gray-700">
          {getTitle()}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:block text-gray-600">
          {user.email}
        </span>

        <button
          onClick={logout}
          className="text-red-500 flex items-center gap-1 hover:text-red-600"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
