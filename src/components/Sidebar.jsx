import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  X, ChevronLeft, ChevronRight,
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
        className={`fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* --- SIDEBAR CONTAINER --- */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col 
        bg-white text-slate-700 border-r border-slate-200 shadow-xl 
        /* Animation Classes */
        transition-all duration-300 ease-in-out
        overflow-x-hidden
        
        /* Mobile: Slide Logic */
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        
        /* Desktop: Always visible + Width Logic */
        md:translate-x-0 md:static md:shadow-none
        
        /* FIX 1: Ensure width is always w-72 on mobile, only use w-20 on md screens if collapsed */
        ${collapsed ? "md:w-20 w-72" : "md:w-72 w-72"}
      `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-100 relative shrink-0">
           
           {/* BRANDING */}
           <div className={`
             flex items-center transition-all duration-300 ease-in-out
             /* FIX 2: Only center content on desktop if collapsed. On mobile, keep standard layout */
             ${collapsed ? "md:justify-center md:px-0 w-full" : "w-full gap-3"}
           `}>
             
             {/* LOGO */}
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 z-10 relative">
               <span className="font-bold text-white text-xs tracking-tighter">CK</span>
             </div>

             {/* TEXT */}
             {/* FIX 3: Force text to be visible on mobile (w-40 opacity-100) even if collapsed is true */}
             <div className={`
               whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
               ${collapsed ? "md:w-0 md:opacity-0 w-40 opacity-100" : "w-40 opacity-100"}
             `}>
               <h2 className="text-sm font-bold truncate leading-tight tracking-wide text-slate-800">ClubKhata</h2>
               <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                 {activeClub?.clubName || "Select Club"}
               </p>
             </div>
           </div>

           {/* Mobile Close Button */}
           <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 p-1 absolute right-4">
             <X size={24} />
           </button>

           {/* Desktop Collapse Toggle */}
           <button
             onClick={() => setCollapsed(!collapsed)}
             className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors absolute -right-3 top-1/2 -translate-y-1/2 border border-slate-200 z-50 shadow-sm"
           >
             {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            if (item.roles && !item.roles.includes(userRole)) return null;

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
                  flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${active 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                  /* FIX 4: Only remove gap on desktop when collapsed. Keep gap on mobile. */
                  ${collapsed ? "md:justify-center md:gap-0 gap-3" : "gap-3"}
                `}
              >
                {/* Icon */}
                <item.icon 
                  size={20} 
                  strokeWidth={active ? 2.5 : 2} 
                  className={`shrink-0 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} 
                />
                
                {/* Label */}
                {/* FIX 5: Force label visible on mobile (w-32 opacity-100) even if collapsed */}
                <span 
                  className={`
                    font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                    ${collapsed ? "md:w-0 md:opacity-0 w-32 opacity-100" : "w-32 opacity-100"}
                  `}
                >
                  {label}
                </span>

                {/* Tooltip (Only on Collapsed + Hover + Desktop) */}
                {collapsed && (
                  <div className="hidden md:block absolute left-14 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
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