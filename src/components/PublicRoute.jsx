import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Optional: Render a spinner here while AuthContext loads
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // 🛑 If user exists, redirect to Dashboard. Otherwise, show the Public Page (Login/Register).
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;