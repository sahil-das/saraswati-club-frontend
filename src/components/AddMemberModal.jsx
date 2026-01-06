import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  X, User, Mail, Phone, AtSign, Lock, Loader2, Shield 
} from "lucide-react";

// Design System
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function AddMemberModal({ onClose, refresh }) {
  const { activeClub } = useAuth(); 
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  // ✅ 1. Determine Suffix based on Active Club
  const emailSuffix = activeClub?.clubCode 
    ? `@${activeClub.clubCode}.com` 
    : "@club.com";

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // ✅ 2. Construct the System ID
      const systemLoginId = `${data.usernamePrefix}${emailSuffix}`.toLowerCase();

      const payload = {
        name: data.name,
        email: systemLoginId,        // System ID as email
        personalEmail: data.personalEmail,
        phone: data.phone,
        password: data.password,
        role: data.role
      };

      // ✅ 3. Call the correct endpoint
      await api.post("/members", payload);
      
      if (refresh) refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User size={20} className="opacity-80"/> New Member Registration
            </h2>
            <p className="text-primary-100 text-xs">Create a system login for {activeClub?.clubName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-primary-700 rounded-lg transition text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Full Name */}
          <Input 
            label="Full Name"
            icon={User}
            placeholder="e.g. Rahul Sharma"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />

          {/* SYSTEM ID (Custom Split Input) */}
          <div>
            <div className="flex justify-between items-end mb-1.5 ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    System Login ID
                </label>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                    UNIQUE
                </span>
            </div>
            
            <div className="flex items-stretch shadow-sm rounded-xl">
               <div className="relative flex-1">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register("usernamePrefix", { required: true, pattern: /^[a-zA-Z0-9.]+$/ })} 
                    className="w-full bg-white border border-slate-200 border-r-0 rounded-l-xl pl-10 pr-3 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-right font-mono text-slate-700 lowercase text-sm" 
                    placeholder="userid" 
                  />
               </div>
               <div className="bg-slate-50 border border-slate-200 px-3 flex items-center rounded-r-xl text-slate-500 text-sm font-mono select-none font-medium border-l-0">
                  {emailSuffix}
               </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
              Member will login using <b>userid{emailSuffix}</b>
            </p>
          </div>

          <div className="h-px bg-slate-100 my-2" />

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
             <Input 
                label="Personal Email (Optional)"
                icon={Mail}
                type="email"
                placeholder="rahul@gmail.com"
                {...register("personalEmail")}
             />
             <Input 
                label="Phone (Optional)"
                icon={Phone}
                type="tel"
                placeholder="9876543210"
                {...register("phone")}
             />
          </div>

          {/* Role & Password */}
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                 Role
               </label>
               <div className="relative">
                 <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                 <select 
                    {...register("role")} 
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 appearance-none"
                 >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                 </select>
               </div>
             </div>

             <Input 
                label="Initial Password"
                icon={Lock}
                type="text"
                defaultValue="123456"
                {...register("password", { required: true })}
             />
          </div>

          <div className="pt-4 flex gap-3">
             <Button variant="secondary" onClick={onClose} className="flex-1">
               Cancel
             </Button>
             <Button type="submit" isLoading={loading} className="flex-1">
               Create Account
             </Button>
          </div>

        </form>
      </div>
    </div>
  );
}