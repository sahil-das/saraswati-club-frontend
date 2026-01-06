import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext"; 
import { 
  Building2, User, Mail, Lock, Phone, ArrowRight, Loader2, 
  Hash, CheckCircle2, ShieldCheck, AtSign, Copy 
} from "lucide-react";

// Components
import { Input } from "../components/ui/Input"; 
import { Button } from "../components/ui/Button";

export default function RegisterClub() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successData, setSuccessData] = useState(null); // Store generated credentials

  // Watch fields for live preview
  const watchUsername = watch("username", "");
  const watchClubCode = watch("clubCode", "");

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    
    try {
      const res = await api.post("/auth/register", {
        clubName: data.clubName,
        clubCode: data.clubCode,
        adminName: data.adminName,
        username: data.username, // 👈 New Field
        email: data.email,       // This becomes 'personalEmail'
        password: data.password,
        phone: data.phone
      });

      if (res.data.success) {
        toast.success("Club registered successfully!");
        // Show success screen with the generated Login ID
        setSuccessData({
            loginId: res.data.user.email, // The system generated ID
            clubName: res.data.club.name
        });
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

  // Live Preview of Login ID
  const previewLoginId = `${watchUsername.toLowerCase().replace(/[^a-z0-9.]/g, "") || "username"}@${watchClubCode.toLowerCase().replace(/[^a-z0-9-]/g, "") || "clubcode"}.com`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans">
      
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-slate-200">
        
        {/* LEFT PANEL: Marketing */}
        <div className="hidden lg:flex lg:w-5/12 bg-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-90 z-10" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 z-0" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-40 z-0" />

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
        <div className="w-full lg:w-7/12 p-8 md:p-12 overflow-y-auto bg-white relative">
          
          {successData ? (
            // ✅ SUCCESS STATE (Shows Login ID)
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Registration Complete!</h2>
                <p className="text-slate-500 mt-2 max-w-md">
                    <span className="font-bold text-slate-800">{successData.clubName}</span> has been created.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8 w-full max-w-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your System Login ID</p>
                    <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                        <code className="text-lg font-mono font-bold text-indigo-600">{successData.loginId}</code>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(successData.loginId);
                                toast.success("Copied to clipboard");
                            }}
                            className="p-2 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                        Please save this ID. You will need it to log in along with your password.
                    </p>
                </div>

                <Button 
                    onClick={() => navigate("/login")} 
                    className="mt-8 w-full max-w-sm py-3"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Proceed to Login
                </Button>
            </div>
          ) : (
            // 📝 REGISTRATION FORM
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
                            placeholder="e.g. netaji2025"
                            icon={Hash}
                            {...register("clubCode", { 
                                required: "Required",
                                pattern: { value: /^[a-zA-Z0-9-]+$/, message: "No spaces" } 
                            })}
                        />
                    </div>
                    </div>
                </div>

                {/* SECTION 2: ADMIN */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 pt-2">
                    <User size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Admin Access</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Admin Name</label>
                        <Input 
                            placeholder="John Doe"
                            icon={User}
                            {...register("adminName", { required: true })}
                        />
                    </div>

                    {/* NEW USERNAME FIELD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 ml-1">Username (Login ID)</label>
                            <Input 
                                placeholder="treasurer"
                                icon={AtSign}
                                {...register("username", { 
                                    required: true, 
                                    pattern: { value: /^[a-zA-Z0-9.]+$/, message: "Letters, numbers, dots only" }
                                })}
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

                    {/* PREVIEW BOX */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center gap-3">
                        <ShieldCheck size={16} className="text-indigo-500 shrink-0" />
                        <p className="text-xs text-indigo-700">
                            Your Login ID will be: <span className="font-mono font-bold">{previewLoginId}</span>
                        </p>
                    </div>

                    <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Personal Email</label>
                    <Input 
                        type="email"
                        placeholder="admin@example.com"
                        icon={Mail}
                        {...register("email", { required: true })}
                    />
                    <p className="text-[10px] text-slate-400 ml-1">Used for notifications & recovery.</p>
                    </div>

                    <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
                    <Input 
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        {...register("password", { required: true, minLength: 6 })}
                    />
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
          )}
        </div>
      </div>
    </div>
  );
}