import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import menuItems from "../config/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const { activeClub } = useAuth();
  const location = useLocation();
  const [frequency, setFrequency] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

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
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col 
        bg-[var(--bg-card)] text-[var(--text-main)] border-r border-[var(--border-color)] shadow-xl 
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:shadow-none
        ${collapsed ? "md:w-20 w-72" : "md:w-72 w-72"} 
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-[var(--border-color)] relative shrink-0">
           
           <div className={`
             flex items-center transition-all duration-300 ease-in-out
             ${collapsed ? "md:justify-center md:px-0 w-full" : "w-full gap-3"}
           `}>
             
            <img 
              src="/logo.png" 
              alt="Club Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white shadow-lg shadow-indigo-100 dark:shadow-none z-10 relative border border-slate-100 dark:border-slate-700" 
            />

             <div className={`
               whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
               ${collapsed ? "md:w-0 md:opacity-0 w-40 opacity-100" : "w-40 opacity-100"}
             `}>
               <h2 className="text-sm font-bold truncate leading-tight tracking-wide text-[var(--text-main)]">ClubKhata</h2>
               <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold truncate">
                 {activeClub?.clubName || "Select Club"}
               </p>
             </div>
           </div>

           <button onClick={onClose} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 absolute right-4">
             <X size={24} />
           </button>

           <button
             onClick={() => setCollapsed(!collapsed)}
             className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-primary-600 transition-colors absolute -right-3 top-1/2 -translate-y-1/2 border border-[var(--border-color)] z-50 shadow-sm"
           >
             {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            if (item.roles && !item.roles.includes(userRole)) return null;

            let label = item.label;
            if (item.path === "/contributions") {
              if (!frequency || frequency === "none") return null;
              label = frequency === "weekly" ? "Weekly Collection" : "Monthly Collection";
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
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-100 dark:ring-primary-800" 
                    : "text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--text-main)]"
                  }
                  ${collapsed ? "md:justify-center md:gap-0 gap-3" : "gap-3"}
                `}
              >
                <item.icon 
                  size={20} 
                  strokeWidth={active ? 2.5 : 2} 
                  className={`shrink-0 ${active ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} 
                />
                
                {/* 🟢 FIXED: Changed w-32 to w-48 to allow longer text */}
                <span 
                  className={`
                    font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                    ${collapsed ? "md:w-0 md:opacity-0 w-48 opacity-100" : "w-48 opacity-100"}
                  `}
                >
                  {label}
                </span>

                {collapsed && (
                  <div className="hidden md:block absolute left-14 px-3 py-1.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-white"></div>
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