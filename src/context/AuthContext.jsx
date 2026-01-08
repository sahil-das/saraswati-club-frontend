// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

/**
 * AuthContext
 * - Works with your /auth/login, /auth/me, /auth/refresh-token and /auth/revoke-token endpoints
 * - Exposes: user, activeClub, availableClubs, loading, login, logout, selectClub
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Helpers ---
  const saveTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (accessToken) api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  };

  const clearLocalSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("activeClubId");
  };

  // --- logout function (attempt to revoke token on server) ---
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      // Attempt to revoke the refresh token on the backend.
      // If the access token is expired this call may fail (protected route).
      // We still proceed to clear frontend session no matter the result.
      if (refreshToken) {
        await api.post("/auth/revoke-token", { token: refreshToken });
      }
    } catch (err) {
      // ignore errors here (network or 401), we'll still clear client-side session
      // console.warn("Revoke token failed", err);
    } finally {
      clearLocalSession();
      setUser(null);
      setAvailableClubs([]);
      setActiveClub(null);

      // Broadcast logout so other tabs/parts of app can react
      try {
        window.dispatchEvent(new Event("logout"));
      } catch (e) {
        /* ignore */
      }

      // redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, []);

  // --- login ---
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user: userData, clubs } = res.data;

      // Save tokens + set header
      saveTokens({ accessToken, refreshToken });

      // Save user + clubs
      setUser(userData || null);
      setAvailableClubs(clubs || []);

      // Choose active club (persist id)
      if (clubs && clubs.length > 0) {
        const chosen = clubs[0];
        setActiveClub(chosen);
        localStorage.setItem("activeClubId", chosen.clubId);
      } else {
        setActiveClub(null);
        localStorage.removeItem("activeClubId");
      }

      return { user: userData, clubs };
    } catch (err) {
      // bubble up error to caller for UI handling
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- select club (UI only, persisted) ---
  const selectClub = (club) => {
    if (!club?.clubId) return;
    setActiveClub(club);
    localStorage.setItem("activeClubId", club.clubId);
  };

  // --- initialize app on mount ---
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = localStorage.getItem("accessToken");
      const storedClubId = localStorage.getItem("activeClubId");

      // If there's no access token, skip attempting /auth/me
      if (!token) {
        setLoading(false);
        return;
      }

      // ensure api has header (in case app reloaded)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // /auth/me will trigger the refresh interceptor if accessToken expired
        const res = await api.get("/auth/me");

        if (!mounted) return;

        const userData = res.data.user || null;
        const clubs = res.data.clubs || [];

        setUser(userData);
        setAvailableClubs(clubs);

        if (storedClubId && clubs.length > 0) {
          const matched = clubs.find((c) => c.clubId === storedClubId);
          setActiveClub(matched || clubs[0]);
          if (!matched) localStorage.setItem("activeClubId", clubs[0].clubId);
        } else if (clubs.length > 0) {
          setActiveClub(clubs[0]);
          localStorage.setItem("activeClubId", clubs[0].clubId);
        } else {
          setActiveClub(null);
          localStorage.removeItem("activeClubId");
        }
      } catch (err) {
        // If refresh fails, axios interceptor should dispatch logout event
        // but if not, fallback to clearing session here.
        // console.error("Auth init error:", err);
        clearLocalSession();
        setUser(null);
        setAvailableClubs([]);
        setActiveClub(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // --- listen for global logout and storage events (multi-tab sync) ---
  useEffect(() => {
    const onGlobalLogout = () => {
      // Ensure local cleanup if another piece of code triggered logout
      clearLocalSession();
      setUser(null);
      setAvailableClubs([]);
      setActiveClub(null);
      setLoading(false);
      // don't redirect here (the originator handles navigation)
    };

    const onStorage = (e) => {
      if (e.key === "accessToken" && !e.newValue) {
        // a different tab cleared tokens -> reflect logout
        onGlobalLogout();
      }
      if (e.key === "activeClubId") {
        // proactive club sync across tabs
        const newClubId = e.newValue;
        if (!newClubId) {
          setActiveClub(null);
        } else {
          // attempt to find club in current availableClubs
          const found = availableClubs.find((c) => c.clubId === newClubId);
          if (found) setActiveClub(found);
        }
      }
    };

    window.addEventListener("logout", onGlobalLogout);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("logout", onGlobalLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, [availableClubs]);

  // value exposed to components
  const value = {
    user,
    availableClubs,
    activeClub,
    loading,
    login,
    logout,
    selectClub,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
