import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import menuItems from "../config/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const { activeClub } = useAuth();
  const location = useLocation();
  const [frequency, setFrequency] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Fetch Year Config
  useEffect(() => {
    const fetchActiveYear = async () => {
      if (activeClub) {
        try {
          const res = await api.get("/years/active");
          if (res.data.data) setFrequency(res.data.data.subscriptionFrequency);
        } catch (err) { console.error(err); }
      }
    };
    fetchActiveYear();
  }, [activeClub]);

  const isActive = (path) => location.pathname === path;
  const userRole = activeClub?.role || "member";

  return (
    <>
      {/* --- MOBILE BACKDROP --- */}
      <div
        className={`fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* --- SIDEBAR CONTAINER --- */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col 
        bg-slate-900 text-white shadow-2xl 
        /* Animation Classes */
        transition-all duration-300 ease-in-out
        
        /* Mobile: Slide Logic */
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        
        /* Desktop: Always visible + Width Logic */
        md:translate-x-0 md:static md:shadow-none
        ${collapsed ? "md:w-20" : "md:w-72 w-72"}
      `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-white/10 relative shrink-0">
           {/* Branding - Animate Width/Opacity */}
           <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
               <span className="font-bold text-white text-xs tracking-tighter">CK</span>
             </div>
             <div className="whitespace-nowrap overflow-hidden">
               <h2 className="text-sm font-bold truncate leading-tight tracking-wide">ClubKhata</h2>
               <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold truncate">
                 {activeClub?.clubName || "Select Club"}
               </p>
             </div>
           </div>

           {/* Mobile Close Button */}
           <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
             <X size={24} />
           </button>

           {/* Desktop Collapse Toggle */}
           <button
             onClick={() => setCollapsed(!collapsed)}
             className="hidden md:flex items-center justify-center w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors absolute -right-3 top-1/2 -translate-y-1/2 border border-slate-700 z-50 shadow-sm"
           >
             {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            if (!item.roles.includes(userRole)) return null;

            let label = item.label;
            if (item.path === "/contributions") {
              if (!frequency || frequency === "none") return null;
              label = frequency === "weekly" ? "Weekly Chanda" : "Monthly Chanda";
            }

            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${active 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {/* Icon - Always visible */}
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                
                {/* Label - Smoothly Collapse */}
                <span 
                  className={`
                    font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                    ${collapsed ? "w-0 opacity-0" : "w-32 opacity-100"}
                  `}
                >
                  {label}
                </span>

                {/* Tooltip (Only on Collapsed + Hover) */}
                {collapsed && (
                  <div className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
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