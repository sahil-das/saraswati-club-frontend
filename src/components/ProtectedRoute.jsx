import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; // Import spinner icon

export default function ProtectedRoute({ children, role }) {
  // 1. Get activeClub from context to check the user's role in the CURRENT club
  const { user, activeClub, loading } = useAuth();

  // ⏳ WAIT for auth check
  if (loading) {
    // UPDATED: Use a proper centered spinner instead of plain text
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying access...</p>
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