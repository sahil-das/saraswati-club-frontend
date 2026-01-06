import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  Phone, Calendar, Shield, ArrowLeft, Loader2, Plus, 
  CheckCircle, IndianRupee, CreditCard, AlertCircle, 
  Mail, Hash, ShieldCheck
} from "lucide-react";
import { clsx } from "clsx";

// Components
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import AddPujaModal from "../components/AddPujaModal"; 

export default function MemberDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [frequency, setFrequency] = useState("weekly"); 
  const [chandaHistory, setChandaHistory] = useState([]);
  const [stats, setStats] = useState({ subPaid: 0, subDue: 0, chandaPaid: 0 });
  
  // Modals
  const [showChandaModal, setShowChandaModal] = useState(false);
  const [confirmPayment, setConfirmPayment] = useState({ isOpen: false, inst: null });

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Subscription & Basic Info
      // We assume the backend returns populated member data here
      const subRes = await api.get(`/subscriptions/member/${memberId}`);
      const data = subRes.data.data;
      
      // Map data carefully. 
      // Note: Adjust 'data.member.xxx' if your backend structure is different (e.g. data.phone vs data.member.phone)
      setMember({
        id: memberId,
        name: data.memberName || data.member?.name,
        // Club ID / User ID
        clubId: data.memberUserId || data.member?.userId || "N/A", 
        // Role
        role: data.member?.role || "member",
        // Phone (Check both root and nested object)
        phone: data.phone || data.member?.phone || "No Phone",
        // Personal Email
        email: data.email || data.member?.email || data.member?.personalEmail || "No Email",
        joinedYear: data.year?.name
      });

      setSubscription(data.subscription);
      setFrequency(data.rules?.frequency || "weekly");

      // 2. Fetch Puja Fees
      try {
        const userIdToFetch = data.memberUserId || data.member?.userId;
        const feeRes = await api.get(`/member-fees/member/${userIdToFetch}`);
        setChandaHistory(feeRes.data.data.records || []);
        
        setStats({
          subPaid: data.subscription?.totalPaid || 0,
          subDue: data.subscription?.totalDue || 0,
          chandaPaid: feeRes.data.data.total || 0
        });
      } catch (e) {
        console.warn("Chanda fetch failed", e);
      }

    } catch (err) {
      console.error("Member Details Error:", err);
      toast.error("Failed to load member data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId && activeClub) fetchData();
  }, [memberId, activeClub]);

  // Handle Payment Toggle
  const handleTogglePayment = async () => {
    const inst = confirmPayment.inst;
    if (!inst) return;

    try {
      const res = await api.post("/subscriptions/pay", {
        subscriptionId: subscription._id,
        installmentNumber: inst.number
      });
      
      setSubscription(res.data.data);
      setStats(prev => ({
        ...prev,
        subPaid: res.data.data.totalPaid,
        subDue: res.data.data.totalDue
      }));
      toast.success("Payment status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setConfirmPayment({ isOpen: false, inst: null });
    }
  };

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center text-indigo-600"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (!member) return (
    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Member not found</h2>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  );

  const totalContribution = stats.subPaid + stats.chandaPaid;
  const progressPercent = subscription ? Math.round((subscription.installments.filter(i => i.isPaid).length / subscription.installments.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* 1. TOP BAR */}
      <div className="flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 transition-all border border-transparent hover:border-slate-200"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 hidden md:block">Member Profile</h1>
      </div>

      {/* 2. PROFILE BANNER */}
      <div className="relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm group">
         {/* Background Pattern */}
         <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-indigo-900 to-slate-900 transition-all group-hover:scale-105 duration-700" />
         
         <div className="relative px-8 pb-8 pt-20 flex flex-col md:flex-row gap-6 items-start md:items-end">
             {/* Avatar */}
             <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl -mt-6">
                <div className={`w-full h-full rounded-xl flex items-center justify-center text-3xl font-bold ${
                    member.role === 'admin' 
                    ? "bg-indigo-100 text-indigo-600" 
                    : "bg-slate-100 text-slate-600"
                }`}>
                    {member.name?.charAt(0)}
                </div>
             </div>

             {/* Info */}
             <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{member.name}</h2>
                    {/* ROLE BADGE */}
                    <span className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                        member.role === 'admin' 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100" 
                            : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                        {member.role === 'admin' ? <ShieldCheck size={12}/> : <Shield size={12}/>}
                        {member.role}
                    </span>
                </div>
                
                {/* DETAILS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-slate-500 font-medium">
                   {/* Phone */}
                   <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0"/> 
                        <span className="text-slate-700">{member.phone}</span>
                   </div>
                   
                   {/* Club ID */}
                   <div className="flex items-center gap-2">
                        <Hash size={14} className="text-slate-400 shrink-0"/> 
                        <span>ID: <span className="font-mono text-slate-700">{member.clubId}</span></span>
                   </div>

                   {/* Email */}
                   <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400 shrink-0"/> 
                        <span className="truncate max-w-[200px]">{member.email}</span>
                   </div>

                   {/* Joined Date */}
                   <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400 shrink-0"/> 
                        <span>Joined: {member.joinedYear || "N/A"}</span>
                   </div>
                </div>
             </div>

             {/* Actions */}
             <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                 {activeClub?.role === "admin" && (
                    <Button 
                        onClick={() => setShowChandaModal(true)}
                        leftIcon={<Plus size={18} />}
                        className="shadow-lg shadow-indigo-200 w-full md:w-auto"
                    >
                        Add Fee
                    </Button>
                 )}
             </div>
         </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SUBSCRIPTION */}
        {frequency !== 'none' && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* PROGRESS CARD */}
            <Card>
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <CreditCard className="text-indigo-600" size={20} /> Subscription Status
                     </h3>
                     <p className="text-sm text-slate-500 mt-1">
                        {frequency === 'monthly' ? 'Monthly' : 'Weekly'} Plan • <span className="font-bold text-slate-700">₹{subscription?.year?.amountPerInstallment}</span> / period
                     </p>
                  </div>
                  <div className="text-right">
                     <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</span>
                     <span className={clsx("text-2xl font-bold font-mono", progressPercent === 100 ? "text-emerald-600" : "text-indigo-600")}>
                        {progressPercent}%
                     </span>
                  </div>
               </div>

               {/* Progress Bar */}
               <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${progressPercent}%` }} 
                  />
               </div>

               {/* THE GRID */}
               <div className={clsx(
                   "grid gap-3",
                   frequency === 'monthly' ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" : "grid-cols-5 sm:grid-cols-8 md:grid-cols-10"
               )}>
                  {subscription?.installments?.map((inst) => {
                    const label = frequency === 'monthly' ? MONTHS[inst.number - 1] : `${inst.number}`;
                    
                    return (
                      <button
                        key={inst.number}
                        onClick={() => setConfirmPayment({ isOpen: true, inst })}
                        disabled={activeClub?.role !== "admin"}
                        className={clsx(
                          "relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 aspect-square",
                          frequency === 'monthly' ? "py-4" : "py-2",
                          inst.isPaid 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm",
                          activeClub?.role !== 'admin' && !inst.isPaid && "opacity-50 cursor-not-allowed bg-slate-50"
                        )}
                        title={inst.isPaid ? `Paid on ${new Date(inst.paidDate).toLocaleDateString()}` : "Mark as Paid"}
                      >
                        {inst.isPaid ? (
                            <CheckCircle size={frequency === 'monthly' ? 20 : 16} strokeWidth={3} />
                        ) : (
                            <span className={clsx("font-bold", frequency === 'monthly' ? "text-sm" : "text-xs")}>{label}</span>
                        )}
                      </button>
                    );
                  })}
               </div>
            </Card>
          </div>
        )}

        {/* RIGHT COLUMN: STATS & CHANDA */}
        <div className={clsx("space-y-6", frequency === 'none' && "lg:col-span-3")}>
           
           {/* FINANCIAL SUMMARY */}
           <div className="grid grid-cols-2 gap-4">
               <Card noPadding className="bg-white border-slate-200 p-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                   <p className="text-xl font-bold text-emerald-600 font-mono">₹{totalContribution.toLocaleString()}</p>
               </Card>
               {frequency !== 'none' && (
                   <Card noPadding className="bg-white border-slate-200 p-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Due</p>
                       <p className={clsx("text-xl font-bold font-mono", stats.subDue > 0 ? "text-rose-500" : "text-slate-400")}>
                           ₹{stats.subDue.toLocaleString()}
                       </p>
                   </Card>
               )}
           </div>

           {/* CHANDA HISTORY */}
           <Card className="min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <IndianRupee className="text-rose-500" size={18} /> Puja Fees
                 </h3>
              </div>

              {chandaHistory.length === 0 ? (
                 <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs font-medium">No extra fees recorded.</p>
                 </div>
              ) : (
                 <div className="space-y-0 relative">
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100" />
                    
                    {chandaHistory.map((fee) => (
                       <div key={fee._id} className="relative pl-8 py-3 group">
                          <div className="absolute left-2 top-4 w-3.5 h-3.5 bg-white border-2 border-rose-200 rounded-full group-hover:border-rose-500 transition-colors" />
                          <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-slate-700">Festival Payment</p>
                                <p className="text-[10px] text-slate-400">{new Date(fee.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="text-sm font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                + ₹{fee.amount}
                              </span>
                          </div>
                          {fee.notes && <p className="text-xs text-slate-400 mt-1 italic">"{fee.notes}"</p>}
                       </div>
                    ))}
                 </div>
              )}
           </Card>

           {/* CONTACT CARD */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Phone size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm">Contact Member</h4>
                    <p className="text-slate-400 text-xs">For dues or updates</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${member.phone}`} className="py-2.5 bg-white text-slate-900 rounded-lg text-xs font-bold text-center hover:bg-slate-100 transition">
                      Call
                  </a>
                  <a href={`sms:${member.phone}`} className="py-2.5 bg-white/10 text-white rounded-lg text-xs font-bold text-center hover:bg-white/20 transition border border-white/10">
                      Message
                  </a>
              </div>
           </div>
        </div>

      </div>

      {/* MODALS */}
      {showChandaModal && (
         <AddPujaModal 
           onClose={() => setShowChandaModal(false)} 
           refresh={fetchData} 
           preSelectedMemberId={member.userId} 
         />
      )}

      {/* PAYMENT CONFIRMATION */}
      <ConfirmModal 
        isOpen={confirmPayment.isOpen}
        onClose={() => setConfirmPayment({ isOpen: false, inst: null })}
        onConfirm={handleTogglePayment}
        title="Update Payment Status?"
        message={`Are you sure you want to mark ${frequency === 'monthly' ? MONTHS[confirmPayment.inst?.number - 1] : `Week ${confirmPayment.inst?.number}`} as ${confirmPayment.inst?.isPaid ? "UNPAID" : "PAID"}?`}
        confirmText={confirmPayment.inst?.isPaid ? "Mark Unpaid" : "Mark Paid"}
        isDangerous={false}
      />
    </div>
  );
}