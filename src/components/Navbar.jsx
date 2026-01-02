import { useState, useRef, useEffect } from "react";
import { Menu, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function Navbar({ setOpen }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ===== UPDATED PAGE TITLE LOGIC ===== */
  const getTitle = () => {
    const path = location.pathname;
    
    if (path === "/") return "Dashboard"; // Root is now Dashboard
    if (path.includes("/profile")) return "My Profile";
    if (path.includes("/weekly")) return "Weekly Contributions";
    if (path.includes("/donations")) return "Donations";
    if (path.includes("/expenses")) return "Expenses";
    if (path.includes("/members")) return "Members";
    if (path.includes("/history")) return "History";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/puja-contributions")) return "Puja Contributions";
    if (path.includes("/collections")) return "Collections Overview";
    if (path.includes("/reports")) return "Reports";
    
    return "Dashboard";
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      
      <div className="flex items-center gap-3">
        <button className="md:hidden text-gray-600" onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">{getTitle()}</h1>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 pl-3 pr-2 py-1 rounded-full transition-all border border-transparent hover:border-gray-200"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700 leading-tight">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">
              {user?.role || "Member"}
            </span>
          </div>
          <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-indigo-100">
            <User size={18} />
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animation-fade-in-up">
            <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            {/* UPDATED LINK */}
            <Link 
              to="/profile" 
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User size={16} /> My Profile
            </Link>
            
            {user?.role === 'admin' && (
              // UPDATED LINK
              <Link 
                to="/settings" 
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings size={16} /> Club Settings
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}