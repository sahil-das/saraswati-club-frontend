import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

import {
  Building2, User, Mail, Lock, Phone, ArrowRight, Loader2, 
  Hash, LayoutDashboard, ShieldCheck, CheckCircle2 
} from "lucide-react";

export default function RegisterClub() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const toast = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    
    try {
      const res = await api.post("/auth/register", {
        clubName: data.clubName,
        clubCode: data.clubCode,
        adminName: data.adminName,
        email: data.email,
        password: data.password,
        phone: data.phone
      });

      if (res.data.success) {
        // You might want a nicer toast here in the future
        toast.success("Registration successful! Please login to continue."); 
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8 font-sans">
      
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* LEFT PANEL: Visual / Marketing (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-5/12 bg-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-90 z-10"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 z-0"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-40 z-0"></div>

          {/* Content */}
          <div className="relative z-20">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xl shadow-lg">
                CK
              </div>
              <span className="text-2xl font-bold tracking-tight">ClubKhata</span>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Manage your community finances with ease.
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
              Track subscriptions, manage expenses, and keep your club members transparently informed.
            </p>
          </div>

          <div className="relative z-20 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-indigo-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Transparent Fund Tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-indigo-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Automated Subscription Logs</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-indigo-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Expense Vouchers & Audit</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Registration Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 overflow-y-auto">
          
          <div className="max-w-lg mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2">Start your club's digital journey today.</p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Registration Failed</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* SECTION 1: ORGANIZATION */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Building2 size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Organization Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Club Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register("clubName", { required: "Club Name is required" })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                        placeholder="e.g. Netaji Sangha"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Unique Club Code</label>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register("clubCode", { 
                          required: "Code is required",
                          pattern: { value: /^[a-zA-Z0-9-]+$/, message: "No spaces or special chars" } 
                        })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300 lowercase"
                        placeholder="e.g. netaji-2025"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 ml-1">
                  * Club Code will be used by members to find your club. Keep it simple.
                </p>
              </div>

              {/* SECTION 2: ADMIN */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 pt-2">
                  <User size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Admin Access</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Admin Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register("adminName", { required: true })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register("phone")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      {...register("email", { required: true })}
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      {...register("password", { required: true, minLength: 6 })}
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-gray-400 ml-1">Must be at least 6 characters.</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-bold text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"} 
                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>

            </form>

            <div className="text-center mt-8 pt-6 border-t border-gray-50">
               <p className="text-gray-500 text-sm">
                 Already managing a club?{" "}
                 <Link to="/login" className="text-indigo-600 font-bold hover:underline hover:text-indigo-700">
                   Sign in here
                 </Link>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}