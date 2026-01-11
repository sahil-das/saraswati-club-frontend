import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. Initialize state: Check localStorage, fallback to 'system'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });

  // 2. Use useLayoutEffect to prevent "flash of light mode" on refresh
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      // Remove both classes first to avoid conflicts
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = systemQuery.matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }

    applyTheme();
    localStorage.setItem("theme", theme);

    // 3. Listen for OS changes ONLY when in 'system' mode
    if (theme === "system") {
      systemQuery.addEventListener("change", applyTheme);
    }

    return () => {
      systemQuery.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  const value = {
    theme,
    setTheme,
    // Helper: returns true if the resolved theme is actually dark
    isDark: 
      theme === "dark" || 
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}