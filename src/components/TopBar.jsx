import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Menu, User, LogOut, Settings, Moon, Sun, Monitor } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  const { user, activeClub, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const themeRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ThemeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor
  }[theme];

  return (
    <header className="bg-[var(--bg-card)] shadow-sm border-b border-[var(--border-color)] h-16 flex items-center justify-between px-4 md:px-8 z-20 relative shrink-0 transition-colors">
      
      {/* Left: Mobile Menu & Branding */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden text-[var(--text-muted)] hover:text-primary-600 transition-colors p-1"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-bold text-[var(--text-main)] md:hidden tracking-tight">
          ClubKhata
        </h2>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* Theme Toggle */}
        <div className="relative" ref={themeRef}>
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 rounded-full text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ThemeIcon size={20} />
          </button>
          
          {isThemeMenuOpen && (
             <div className="absolute right-0 mt-2 w-32 bg-[var(--bg-card)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setIsThemeMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      theme === t ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t === 'light' && <Sun size={16} />}
                    {t === 'dark' && <Moon size={16} />}
                    {t === 'system' && <Monitor size={16} />}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none group text-left"
          >
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[var(--text-main)] group-hover:text-primary-600 transition-colors">
                {user?.name}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider text-right ${
                activeClub?.role === 'admin' ? 'text-primary-500' : 'text-[var(--text-muted)]'
              }`}>
                {activeClub?.role || "Member"}
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              {user?.name?.charAt(0)}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-[var(--bg-card)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200 z-50">
              
              <div className="p-4 border-b border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-[var(--text-main)] truncate" title={user?.email}>
                  {user?.email}
                </p>
              </div>

              <div className="p-2 space-y-1">
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-lg transition-colors"
                >
                  <User size={18} /> My Profile
                </Link>
                
                <Link 
                  to="/settings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-lg transition-colors"
                >
                  <Settings size={18} /> Settings
                </Link>
              </div>

              <div className="p-2 border-t border-[var(--border-color)]">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
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