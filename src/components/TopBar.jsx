import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Bell, User, LogOut, Settings } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  const { user, activeClub, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 z-20 relative shrink-0">
      
      {/* Left: Mobile Menu & Branding */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors p-1"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 md:hidden tracking-tight">
          ClubKhata
        </h2>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none group text-left"
          >
            {/* Name & Role Label (Hidden on small mobile) */}
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                {user?.name}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider text-right ${
                activeClub?.role === 'admin' ? 'text-indigo-500' : 'text-slate-400'
              }`}>
                {activeClub?.role || "Member"}
              </p>
            </div>
            
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              {user?.name?.charAt(0)}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200 z-50">
              
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 truncate" title={user?.email}>
                  {user?.email}
                </p>
              </div>

              <div className="p-2 space-y-1">
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  <User size={18} /> My Profile
                </Link>
                
                <Link 
                  to="/settings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  <Settings size={18} /> Settings
                </Link>
              </div>

              <div className="p-2 border-t border-gray-50">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}