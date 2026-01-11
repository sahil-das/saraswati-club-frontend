import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";
import { Loader2 } from "lucide-react";

export default function RequireSubscription() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const res = await api.get("/years/active");
        const freq = res.data.data?.subscriptionFrequency;
        
        // Only allow if frequency is NOT 'none'
        if (freq && freq !== "none") {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      } catch (err) {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full text-primary-600">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Redirect to dashboard if not allowed
  return allowed ? <Outlet /> : <Navigate to="/" replace />;
}