import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; // 👈 Toast
import api from "../api/axios"; 
import { 
  IndianRupee, Wallet, Calendar, User, Mail, Phone, Lock, 
  Camera, Edit3, AtSign, Save, X
} from "lucide-react";
import { Button } from "../components/ui/Button"; // 👈 UI Component

export default function UserProfile() {
  const { user: authUser, setUser: setGlobalUser } = useAuth(); 
  const toast = useToast();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); 

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", personalEmail: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
         api.get("/auth/me"),
         api.get("/members/my-stats")
      ]);
      
      const userData = profileRes.data.user; 
      setUser(userData);
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        personalEmail: userData.personalEmail || "",
      });

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("Error loading profile", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/profile", formData);
      const updatedUser = data.data;

      setUser(updatedUser);
      if (setGlobalUser) setGlobalUser(updatedUser); 
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your personal details and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-6 relative">
              <div className="-mt-12 mb-3 inline-block relative">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                   </div>
                </div>
              </div>

              <div className="pb-6">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                    {user?.role || "Member"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Cycle</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Festival Chanda</span>
                   <span className="font-bold text-slate-900 font-mono">₹{stats?.festivalChandaTotal || 0}</span>
                </div>
                {stats?.frequency !== 'none' && (
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500">Subscription Paid</span>
                     <span className="font-bold text-emerald-600 font-mono">₹{stats?.totalPaid || 0}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-sm">
                   <span className="text-slate-500">Pending Dues</span>
                   <span className="font-bold text-rose-600 font-mono">₹{stats?.totalDue || 0}</span>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS & CONTENT */}
        <div className="lg:col-span-8">
          
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-6 inline-flex w-full md:w-auto">
            {['overview', 'settings', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${
                  activeTab === tab 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><IndianRupee size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Festival Contribution</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">₹{stats?.festivalChandaTotal || 0}</h3>
                </div>
              </div>
              {stats?.frequency !== 'none' && (
                <>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Wallet size={24} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Subscription Paid</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">₹{stats?.totalPaid || 0}</h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 md:col-span-2">
                    <div className={`p-3 rounded-xl ${stats?.totalDue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Pending Dues</p>
                      <h3 className={`text-2xl font-bold mt-1 font-mono ${stats?.totalDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        ₹{stats?.totalDue || 0}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {stats?.totalDue > 0 ? "Please clear your dues soon." : "You are all caught up!"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Personal Info</h3>
                {!isEditing ? (
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)} leftIcon={<Edit3 size={16}/>}>
                    Edit Profile
                  </Button>
                ) : (
                  <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                    Editing Mode
                  </span>
                )}
              </div>

              <form onSubmit={handleInfoUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Personal Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled={!isEditing}
                        value={formData.personalEmail}
                        onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">System ID</label>
                    <div className="relative">
                      <AtSign size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled
                        value={user?.email || ""}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" leftIcon={<Save size={18}/>}>Save Changes</Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in">
               <h3 className="font-bold text-lg text-slate-800 mb-6">Change Password</h3>
               <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Password</label>
                    <input 
                      type="password" required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Password</label>
                      <input 
                        type="password" required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm</label>
                      <input 
                        type="password" required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="secondary">Update Password</Button>
                  </div>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}