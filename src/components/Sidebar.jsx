import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  X,
  Archive,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ open, setOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  // Auto-close sidebar on route change (mobile UX)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 transition";

  const activeClass =
    "bg-indigo-100 text-indigo-700 font-medium";

  return (
    <aside
      className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white border-r p-4
      transform transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-indigo-600">
          Saraswati Puja
        </h2>

        <button
          className="md:hidden"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-2">
        {/* DASHBOARD */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* MEMBERS (ADMIN ONLY) */}
        {user.role === "admin" && (
          <NavLink
            to="/dashboard/members"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Users size={18} />
            Members
          </NavLink>
        )}

        {/* WEEKLY CONTRIBUTIONS */}
        <NavLink
          to="/dashboard/weekly"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <Wallet size={18} />
          Weekly Contributions
        </NavLink>

        {/* DONATIONS */}
        <NavLink
          to="/dashboard/donations"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <Wallet size={18} />
          Donations
        </NavLink>

        {/* EXPENSES */}
        <NavLink
          to="/dashboard/expenses"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FileText size={18} />
          Expenses
        </NavLink>

        {/* HISTORY (PREVIOUS YEARS) */}
        {user.role === "admin" && (
          <NavLink
            to="/dashboard/history"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Archive size={18} />
            History
          </NavLink>
        )}

        {/* REPORTS (ADMIN ONLY) */}
        {user.role === "admin" && (
          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <FileText size={18} />
            Reports
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
