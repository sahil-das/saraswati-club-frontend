import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext"; // 👈 Toast
import { 
  Building2, User, Mail, Lock, Phone, ArrowRight, Loader2, 
  Hash, CheckCircle2, ShieldCheck 
} from "lucide-react";

// Components
import { Input } from "../components/ui/Input"; // 👈 UI Component
import { Button } from "../components/ui/Button";

export default function RegisterClub() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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
        toast.success("Club registered successfully! Please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans">
      
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-slate-200">
        
        {/* LEFT PANEL: Marketing (Visible on Large Screens) */}
        <div className="hidden lg:flex lg:w-5/12 bg-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-90 z-10" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 z-0" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-40 z-0" />

          {/* Brand Content */}
          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xl shadow-lg">
                CK
              </div>
              <span className="text-2xl font-bold tracking-tight">ClubKhata</span>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Modern finance for your community.
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
              Track subscriptions, manage expenses, and keep your club members transparently informed.
            </p>
          </div>

          {/* Feature List */}
          <div className="relative z-20 space-y-4">
            {[
              "Transparent Fund Tracking",
              "Automated Subscription Logs", 
              "Expense Vouchers & Audit"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-indigo-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Registration Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 overflow-y-auto bg-white">
          
          <div className="max-w-lg mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="text-slate-500 mt-2">Start your club's digital journey today.</p>
            </div>

            {serverError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Registration Failed</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* SECTION 1: ORGANIZATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building2 size={18} className="text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Organization Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Club Name</label>
                    <Input 
                        placeholder="e.g. Netaji Sangha"
                        icon={Building2}
                        {...register("clubName", { required: "Required" })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Club Code</label>
                    <Input 
                        placeholder="e.g. netaji-2025"
                        icon={Hash}
                        {...register("clubCode", { 
                          required: "Required",
                          pattern: { value: /^[a-zA-Z0-9-]+$/, message: "No spaces" } 
                        })}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 ml-1 italic">
                  * Club Code is unique and used for member login.
                </p>
              </div>

              {/* SECTION 2: ADMIN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 pt-2">
                  <User size={18} className="text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Admin Access</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Admin Name</label>
                    <Input 
                        placeholder="John Doe"
                        icon={User}
                        {...register("adminName", { required: true })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Phone</label>
                    <Input 
                        placeholder="+91..."
                        icon={Phone}
                        {...register("phone", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                  <Input 
                      type="email"
                      placeholder="admin@example.com"
                      icon={Mail}
                      {...register("email", { required: true })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
                  <Input 
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      {...register("password", { required: true, minLength: 6 })}
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Min 6 characters.</p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-3.5 shadow-lg shadow-indigo-200"
                  isLoading={loading}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Complete Registration
                </Button>
              </div>

            </form>

            <div className="text-center mt-8 pt-6 border-t border-slate-50">
               <p className="text-slate-500 text-sm font-medium">
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