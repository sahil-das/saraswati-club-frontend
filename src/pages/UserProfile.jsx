import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import { getProfile, updateProfile, changePassword, getMyStats } from "../api/User"; 
import { 
  IndianRupee, Wallet, Calendar, User, Mail, Phone, Lock, 
  Edit3, AtSign, Save, Eye, EyeOff
} from "lucide-react";
import { Button } from "../components/ui/Button"; 

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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        getProfile(),
        getMyStats()
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
      const { data } = await updateProfile(formData);
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
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (error) {
      if (!error.response) {
        toast.error("Network error: please check your connection");
        return;
      }
      const { status, data } = error.response;
      if (status === 401) {
        toast.error(data?.message || "Current password is incorrect");
        return;
      }
      toast.error(data?.message || 'Password update failed');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center text-primary-600">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Account Settings</h1>
        <p className="text-[var(--text-muted)] text-sm">Manage your personal details and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden relative group">
            <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-800 relative">
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-6 relative">
              <div className="-mt-12 mb-3 inline-block relative">
                <div className="h-24 w-24 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-card)] shadow-md flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                   </div>
                </div>
              </div>

              <div className="pb-6">
                <h2 className="text-xl font-bold text-[var(--text-main)]">{user?.name}</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/30 uppercase tracking-wide">
                    {user?.role || "Member"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-wide">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Current Cycle</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)]">Festival Fee</span>
                    <span className="font-bold text-[var(--text-main)] font-mono">₹{stats?.festivalChandaTotal || 0}</span>
                 </div>
                 {stats?.frequency !== 'none' && (
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--text-muted)]">
                        {stats?.frequency === 'weekly' ? 'Weekly Contribution' : stats?.frequency === 'monthly' ? 'Monthly Contribution' : 'Subscription Paid'}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{stats?.totalPaid || 0}</span>
                   </div>
                 )}
                 {stats?.frequency !== 'none' && (
                   <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center text-sm">
                      <span className="text-[var(--text-muted)]">Pending Dues</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">₹{stats?.totalDue || 0}</span>
                   </div>
                 )}
              </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS & CONTENT */}
        <div className="lg:col-span-8">
          
          {/* Tabs */}
          <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] p-1 mb-6 inline-flex w-full md:w-auto">
            {['overview', 'settings', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${
                  activeTab === tab 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-200 dark:ring-primary-800' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
              <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-start gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl"><IndianRupee size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Festival Contribution</p>
                  <h3 className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">₹{stats?.festivalChandaTotal || 0}</h3>
                </div>
              </div>
              {stats?.frequency !== 'none' && (
                <>
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl"><Wallet size={24} /></div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase">
                        {stats?.frequency === 'weekly' ? 'Weekly Contribution' : stats?.frequency === 'monthly' ? 'Monthly Contribution' : 'Subscription Paid'}
                      </p>
                      <h3 className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">₹{stats?.totalPaid || 0}</h3>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-start gap-4 md:col-span-2">
                    <div className={`p-3 rounded-xl ${stats?.totalDue > 0 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Pending Dues</p>
                      <h3 className={`text-2xl font-bold mt-1 font-mono ${stats?.totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                        ₹{stats?.totalDue || 0}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
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
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-[var(--text-main)]">Personal Info</h3>
                {!isEditing ? (
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)} leftIcon={<Edit3 size={16}/>}>
                    Edit Profile
                  </Button>
                ) : (
                  <span className="text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                    Editing Mode
                  </span>
                )}
              </div>

              <form onSubmit={handleInfoUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Personal Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled={!isEditing}
                        value={formData.personalEmail}
                        onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">System ID</label>
                    <div className="relative">
                      <AtSign size={18} className="absolute left-3 top-3 text-slate-400"/>
                      <input 
                        disabled
                        value={user?.email || ""}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" leftIcon={<Save size={18}/>}>Save Changes</Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-6 animate-in fade-in">
               <h3 className="font-bold text-lg text-[var(--text-main)] mb-6">Change Password</h3>
               <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-4">
                 <div>
                   <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">Current Password</label>
                   <div className="relative">
                     <input 
                       type={showCurrent ? "text" : "password"} required
                       value={passwordData.currentPassword}
                       onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none pr-10 transition-all"
                     />
                     <button
                       type="button"
                       onClick={() => setShowCurrent(s => !s)}
                       className="absolute right-2 top-2.5 text-slate-400 p-1"
                     >
                       {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">New Password</label>
                     <div className="relative">
                       <input 
                         type={showNew ? "text" : "password"} required
                         value={passwordData.newPassword}
                         onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                         className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none pr-10 transition-all"
                       />
                       <button
                         type="button"
                         onClick={() => setShowNew(s => !s)}
                         className="absolute right-2 top-2.5 text-slate-400 p-1"
                       >
                         {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">Confirm</label>
                     <div className="relative">
                       <input 
                         type={showConfirm ? "text" : "password"} required
                         value={passwordData.confirmPassword}
                         onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                         className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none pr-10 transition-all"
                       />
                       <button
                         type="button"
                         onClick={() => setShowConfirm(s => !s)}
                         className="absolute right-2 top-2.5 text-slate-400 p-1"
                       >
                         {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
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