import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ⏳ WAIT for auth check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // 🔒 AFTER loading, decide
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
