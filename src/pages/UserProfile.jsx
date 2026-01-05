import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 
import { IndianRupee, Wallet, Calendar, Shield } from "lucide-react";

export default function UserProfile() {
  const { user: authUser } = useAuth(); 
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- EDIT MODES ---
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- FORM DATA ---
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // --- ERROR STATES ---
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const profileRes = await api.get("/auth/me");
        const userData = profileRes.data.user; 
        
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });

        // 2. Fetch Stats
        try {
          const statsRes = await api.get("/members/my-stats");
          if (statsRes.data.success) {
            setStats(statsRes.data.data);
          }
        } catch (statsErr) {
          console.warn("Could not fetch stats:", statsErr);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ FIX: Handle Profile Update Correctly
  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    try {
      const { data } = await api.put("/auth/profile", formData);
      
      // 🛑 FIX: Backend returns { data: user }, NOT { user: user }
      setUser(data.data); 
      
      setIsEditingInfo(false); 
    } catch (error) {
      setProfileError(error.response?.data?.message || "Update failed");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password changed successfully.");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Password update failed");
    }
  };

  if (loading) return <div className="p-10 text-center text-indigo-600">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
         <Shield className="text-indigo-600"/> My Profile
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* --- LEFT COLUMN: IDENTITY & STATS --- */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
            <div className="relative">
                <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto mb-3 shadow-md">
                    <div className="w-full h-full bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
                <span className="inline-block px-4 py-1 text-xs font-bold tracking-wide text-indigo-700 bg-indigo-50 rounded-full uppercase border border-indigo-100">
                    {user?.role || "Member"}
                </span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex justify-between">
               <span>{stats?.cycleName || "Active Cycle"}</span>
               <span className="text-indigo-600">{new Date().getFullYear()}</span>
            </h3>
            
            <div className="space-y-5">
              
              {/* 1. Festival Chanda (Always Visible) */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <IndianRupee size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Festival Chanda</p>
                        <p className="text-sm text-gray-400">Total Contribution</p>
                    </div>
                 </div>
                 <span className="text-xl font-bold text-emerald-600">
                    ₹{stats?.festivalChandaTotal || 0}
                 </span>
              </div>

              {/* 2. Conditional Weekly/Monthly Stats */}
              {stats?.frequency !== 'none' && (
                <>
                  <div className="h-px bg-gray-50 w-full"></div>
                  
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Wallet size={20} />
                        </div>
                        <div>
                            {/* ✅ FIX: Dynamic Label */}
                            <p className="text-xs text-gray-500 font-bold uppercase">
                                {stats?.frequency === 'monthly' ? "Monthly" : "Weekly"} Subscription
                            </p>
                            <p className="text-sm text-gray-400">Total Paid</p>
                        </div>
                     </div>
                     <span className="text-xl font-bold text-indigo-600">
                        ₹{stats?.totalPaid || 0}
                     </span>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stats?.totalDue > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Pending Due</p>
                            <p className="text-sm text-gray-400">To Clear</p>
                        </div>
                     </div>
                     <span className={`text-xl font-bold ${stats?.totalDue > 0 ? "text-red-500" : "text-gray-400"}`}>
                        ₹{stats?.totalDue || 0}
                     </span>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS & SETTINGS --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. PERSONAL DETAILS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
              {!isEditingInfo && (
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-bold hover:underline"
                >
                  Edit Details
                </button>
              )}
            </div>

            {isEditingInfo ? (
              <form onSubmit={handleInfoUpdate} className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>
                
                {profileError && <p className="text-red-500 text-sm">{profileError}</p>}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsEditingInfo(false); setProfileError(""); }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm font-medium">Full Name</span>
                  <span className="text-gray-800 font-bold">{user?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm font-medium">Email Address</span>
                  <span className="text-gray-800 font-bold">{user?.email}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-500 text-sm font-medium">Phone Number</span>
                  <span className="text-gray-800 font-bold">{user?.phone || "Not set"}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. PASSWORD & SECURITY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Security</h3>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-bold hover:underline"
                >
                  Change Password
                </button>
              )}
            </div>

            {passwordSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 flex items-center gap-2">
                   <Shield size={16}/> {passwordSuccess}
                </div>
            )}

            {!isChangingPassword ? (
              <p className="text-gray-400 text-sm italic">
                Password is hidden for security.
              </p>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </div>
                </div>

                {passwordError && <div className="text-red-600 text-sm font-medium">{passwordError}</div>}
                
                <div className="flex justify-end gap-3 pt-2">
                    <button
                    type="button"
                    onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        setPasswordError("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-6 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                    >
                    Update Password
                    </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}