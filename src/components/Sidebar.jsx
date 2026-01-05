import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  LogOut,
  ShieldCheck,
  X,
  Settings,
  CreditCard,
  FileText,
  BadgeIndianRupee,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import menuItems from "../config/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const { user, activeClub, logout } = useAuth();
  const location = useLocation();
  // State to track if we should show Weekly/Monthly link
  const [frequency, setFrequency] = useState(null);

  const [collapsed, setCollapsed] = useState(false); // State for desktop collapse

  // ✅ Fetch Active Year to determine Menu Label
  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const res = await api.get("/years/active");
        if (res.data.data) {
          setFrequency(res.data.data.subscriptionFrequency); // 'weekly', 'monthly', or 'none'
        }
      } catch (err) {
        console.error("Failed to fetch year config", err);
      }
    };

    if (activeClub) fetchActiveYear();
  }, [activeClub]);

  const isActive = (path) => location.pathname === path;

  // Derive current user role (fall back to 'member' if absent)
  const userRole = activeClub?.role || "member";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
        fixed md:static inset-y-0 left-0 z-40
        flex flex-col shadow-2xl
        /* Gradient Background for "Add Color" request */
        bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white
        /* Width Transition */
        ${collapsed ? "w-20" : "w-72"}
        /* Mobile Slide Animation */
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
      >
        {/* HEADER */}
        <div
          className={`flex items-center justify-between p-4 border-b border-white/10 h-16 transition-all`}
        >
          {/* Logo / Club Name */}
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-full opacity-100"
            }`}
          >
            {/* Brand Icon (Fixed as 'CK') */}
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
              <span className="font-bold text-white text-xs tracking-tighter">CK</span>
            </div>
            
            <div className="whitespace-nowrap overflow-hidden">
              {/* Main Product Name */}
              <h2 className="text-sm font-bold truncate leading-tight tracking-wide">
                ClubKhata
              </h2>
              
              {/* Active Club Name (Subtitle) */}
              <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold truncate flex items-center gap-1">
                 {activeClub?.clubName || "Select Club"}
              </p>
            </div>
          </div>
          {/* Toggle Button (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors absolute right-4 z-50"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close Button (Mobile) */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
          {menuItems.map((item) => {
            // 1. Role Check
            if (!item.roles.includes(userRole)) return null;

            // 2. Dynamic Logic for Subscriptions/Chanda
            let label = item.label;

            if (item.path === "/contributions") {
              // HIDE if no frequency set
              if (!frequency || frequency === "none") return null;

              // RENAME based on type
              label = frequency === "weekly" ? "Weekly Chanda" : "Monthly Chanda";
            }

            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? label : ""}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative
                  ${active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {/* Active Indicator Line (Left) */}
                {active && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full blur-[2px]" />
                )}

                <div
                  className={`transition-transform duration-300 ${
                    active && !collapsed ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                </div>

                <span
                  className={`
                  font-medium whitespace-nowrap transition-all duration-300
                  ${collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}
                `}
                >
                  {label}
                </span>

                {/* Hover Tooltip (Only when collapsed) */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

      </div>
    </>
  );
}
