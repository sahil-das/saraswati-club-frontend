import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  X,
  Archive,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ open, setOpen }) {
  const { user } = useAuth();
  const location = useLocation();

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-indigo-600">
          Saraswati Puja
        </h2>
        <button className="md:hidden" onClick={() => setOpen(false)}>
          <X />
        </button>
      </div>

      <nav className="space-y-2">
        {/* DASHBOARD HOME */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* MEMBERS */}
        {user?.role === "admin" && (
          <NavLink
            to="/members"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Users size={18} />
            Members
          </NavLink>
        )}

        {/* WEEKLY */}
        <NavLink
          to="/weekly"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <Wallet size={18} />
          Weekly Contributions
        </NavLink>

        {/* DONATIONS */}
        <NavLink
          to="/donations"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <Wallet size={18} />
          Donations
        </NavLink>

        {/* EXPENSES */}
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FileText size={18} />
          Expenses
        </NavLink>

        {/* HISTORY */}
        {user?.role === "admin" && (
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Archive size={18} />
            History
          </NavLink>
        )}

        {/* REPORTS */}
        {user?.role === "admin" && (
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <FileText size={18} />
            Reports
          </NavLink>
        )}

        {/* SETTINGS */}
        {user?.role === "admin" && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
        )}
      </nav>
    </aside>
  );
}