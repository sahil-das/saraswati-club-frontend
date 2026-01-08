import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  // 1. Get activeClub from context to check the user's role in the CURRENT club
  const { user, activeClub, loading } = useAuth();

  // ⏳ WAIT for auth check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // 🔒 Check 1: Must be logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🛡️ Check 2: RBAC (Role-Based Access Control)
  // If the route requires a specific role (e.g., 'admin'), check if the
  // current active club's role matches.
  if (role && activeClub?.role !== role) {
    // User is logged in but doesn't have permission for this club
    return <Navigate to="/" replace />;
  }

  return children;
}